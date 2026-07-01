import path from "node:path";

import { apps, getApp, rootDir } from "./config.mjs";
import {
  ensureEnvFile,
  getNpmCommand,
  logError,
  logInfo,
  logWarning,
  parseEnvFile,
  resolveSystemPython,
  resolveVenvPython,
  runCommand,
} from "./utils.mjs";

async function installPythonApp(appKey) {
  const app = getApp(appKey);
  const pythonBootstrap = resolveSystemPython();

  if (!pythonBootstrap) {
    throw new Error("Python 3.12+ is required but was not found on PATH.");
  }

  if (!resolveVenvPython(app.cwd)) {
    logInfo(`Creating ${app.label} virtual environment in ${app.label}/.venv`);
    await runCommand({
      label: app.label,
      color: app.color,
      cwd: app.cwd,
      command: pythonBootstrap,
      args: ["-m", "venv", ".venv"],
    });
  }

  const python = resolveVenvPython(app.cwd);
  if (!python) {
    throw new Error(
      `Unable to locate the ${app.label} virtual environment Python executable.`,
    );
  }

  await runCommand({
    label: app.label,
    color: app.color,
    cwd: app.cwd,
    command: python,
    args: ["-m", "pip", "install", "--upgrade", "pip"],
  });

  await runCommand({
    label: app.label,
    color: app.color,
    cwd: app.cwd,
    command: python,
    args: ["-m", "pip", "install", "-r", "requirements-dev.txt"],
  });
}

async function installNodeApp(appKey) {
  const app = getApp(appKey);

  await runCommand({
    label: app.label,
    color: app.color,
    cwd: app.cwd,
    command: getNpmCommand(),
    args: ["install"],
  });
}

function ensureEnvFiles() {
  for (const app of apps) {
    const created = ensureEnvFile(app.envExampleFile, app.envFile);

    if (created) {
      logInfo(`Created ${path.relative(rootDir, app.envFile)} from the example template.`);
    }
  }
}

function warnAboutBackendPlaceholder() {
  const backend = getApp("backend");
  const envValues = parseEnvFile(backend.envFile);
  const unresolvedVariables = [
    {
      key: "DATABASE_URL",
      value: envValues.DATABASE_URL ?? "",
      placeholder: "db.example.supabase.co",
      localIndicators: ["127.0.0.1:54322", "localhost:54322", "YOUR_DB_PASSWORD", "YOUR_PROJECT_REF"],
    },
    {
      key: "SUPABASE_URL",
      value: envValues.SUPABASE_URL ?? "",
      placeholder: "your-project.supabase.co",
      localIndicators: ["127.0.0.1:54321", "localhost:54321", "YOUR_PROJECT_REF"],
    },
    {
      key: "SUPABASE_ANON_KEY",
      value: envValues.SUPABASE_ANON_KEY ?? "",
      placeholder: "your-anon-key",
      localIndicators: [],
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      value: envValues.SUPABASE_SERVICE_ROLE_KEY ?? "",
      placeholder: "your-service-role-key",
      localIndicators: [],
    },
  ].filter(
    ({ value, placeholder, localIndicators }) =>
      value.length === 0 ||
      value.includes(placeholder) ||
      localIndicators.some((indicator) => value.includes(indicator)),
  );

  if (unresolvedVariables.length > 0) {
    logWarning(
      `backend/.env still has unresolved hosted Supabase settings (${unresolvedVariables
        .map(({ key }) => key)
        .join(", ")}). Copy values from the Supabase dashboard into backend/.env, then run \`npm run supabase:link\` and \`npm run supabase:db:push\` to apply migrations.`,
    );
  }
}

function warnAboutDummyAgentPlaceholder() {
  const dummyAgent = getApp("dummy-agent");
  const envValues = parseEnvFile(dummyAgent.envFile);
  const unresolvedVariables = [
    {
      key: "GEMINI_API_KEY",
      value: envValues.GEMINI_API_KEY ?? "",
      placeholder: "your-gemini-api-key",
    },
    {
      key: "RUNLOOP_API_URL",
      value: envValues.RUNLOOP_API_URL ?? "",
      placeholder: "",
    },
    {
      key: "RUNLOOP_API_KEY",
      value: envValues.RUNLOOP_API_KEY ?? "",
      placeholder: "your-runloop-api-key",
    },
  ].filter(
    ({ key, value, placeholder }) =>
      (key !== "RUNLOOP_API_URL" && (value.length === 0 || value.includes(placeholder))) ||
      (key === "RUNLOOP_API_URL" && value.length === 0),
  );

  if (unresolvedVariables.length > 0) {
    logWarning(
      `dummy-agent/.env still has unresolved settings (${unresolvedVariables
        .map(({ key }) => key)
        .join(", ")}). Update them before expecting the Gemini chat loop to start cleanly.`,
    );
  }
}

async function main() {
  const isPostinstall = process.argv.includes("--postinstall");

  logInfo(
    isPostinstall
      ? "Installing Runloop application dependencies from root postinstall."
      : "Installing Runloop application dependencies.",
  );

  ensureEnvFiles();

  await installPythonApp("backend");
  await installPythonApp("dummy-agent");
  await installPythonApp("sdk-python");
  await installNodeApp("frontend");
  await installNodeApp("landing");

  warnAboutBackendPlaceholder();
  warnAboutDummyAgentPlaceholder();
  logInfo(
    "Setup complete. Run `npm run dev` for the platform or `npm run dev:dummy-agent` for the Gemini reference agent.",
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown setup failure.";
  logError(message);
  process.exit(1);
});
