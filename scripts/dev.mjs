import { getApp, apps } from "./config.mjs";
import {
  fileExists,
  getAppHost,
  getAppPort,
  getNpmCommand,
  logError,
  logInfo,
  logWarning,
  resolveVenvPython,
  spawnWithPrefix,
} from "./utils.mjs";

const requestedApps = process.argv.slice(2);
const selectedApps =
  requestedApps.length > 0
    ? requestedApps.map((key) => getApp(key))
    : apps.filter((app) => app.includeInDefaultDev !== false);

function assertReady(app) {
  if (app.runtime === "python") {
    const python = resolveVenvPython(app.cwd);

    if (!python) {
      throw new Error(
        `${app.label}/.venv is missing. Run \`npm install\` or \`npm run setup\` at the repository root first.`,
      );
    }

    return;
  }

  const nodeModulesPath = `${app.cwd}/node_modules`;
  if (!fileExists(nodeModulesPath)) {
    throw new Error(`${app.label} dependencies are missing. Run \`npm install\` at the repository root first.`);
  }
}

function createProcessDefinition(app) {
  if (app.key === "backend") {
    const host = getAppHost(app);
    const port = getAppPort(app);
    const python = resolveVenvPython(app.cwd);

    return {
      command: python,
      args: ["-m", "uvicorn", "main:app", "--reload", "--host", host, "--port", port],
      url: `http://localhost:${port}`,
    };
  }

  if (app.key === "dummy-agent") {
    const python = resolveVenvPython(app.cwd);

    return {
      command: python,
      args: ["main.py"],
      description: "interactive terminal chat",
    };
  }

  if (app.runtime === "python") {
    throw new Error(`${app.label} does not expose a long-running dev process.`);
  }

  const host = getAppHost(app);
  const port = getAppPort(app);

  return {
    command: getNpmCommand(),
    args: ["run", "dev"],
    env: {
      HOST: host,
      PORT: port,
    },
    url: `http://localhost:${port}`,
  };
}

for (const app of selectedApps) {
  assertReady(app);
}

logInfo(
  `Starting ${selectedApps
    .map((app) => {
      const definition = createProcessDefinition(app);
      const label = definition.url ?? definition.description ?? app.label;
      return `${app.label} (${label})`;
    })
    .join(", ")}.`,
);

const children = [];
let shuttingDown = false;

function shutdown(signal = "SIGTERM") {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on("SIGINT", () => {
  if (shuttingDown) {
    return;
  }

  logWarning("Stopping Runloop development processes.");
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  if (shuttingDown) {
    return;
  }

  shutdown("SIGTERM");
});

for (const app of selectedApps) {
  const definition = createProcessDefinition(app);
  const child = spawnWithPrefix({
    label: app.label,
    color: app.color,
    cwd: app.cwd,
    command: definition.command,
    args: definition.args,
    env: definition.env,
  });

  children.push(child);

  child.once("error", (error) => {
    if (shuttingDown) {
      return;
    }

    logError(`${app.label} failed to start: ${error.message}`);
    shutdown();
    process.exit(1);
  });

  child.once("close", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal === null && code === 0 && app.allowNormalExit) {
      logInfo(`${app.label} exited cleanly.`);
      process.exit(0);
    }

    const reason =
      signal !== null
        ? `signal ${signal}`
        : `exit code ${code ?? "unknown"}`;

    logError(`${app.label} exited unexpectedly with ${reason}. Stopping the remaining processes.`);
    shutdown();
    process.exit(code ?? 1);
  });
}
