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
    },
    {
      key: "SUPABASE_URL",
      value: envValues.SUPABASE_URL ?? "",
      placeholder: "your-project.supabase.co",
    },
    {
      key: "SUPABASE_ANON_KEY",
      value: envValues.SUPABASE_ANON_KEY ?? "",
      placeholder: "your-anon-key",
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      value: envValues.SUPABASE_SERVICE_ROLE_KEY ?? "",
      placeholder: "your-service-role-key",
    },
  ].filter(
    ({ value, placeholder }) => value.length === 0 || value.includes(placeholder),
  );

  if (unresolvedVariables.length > 0) {
    logWarning(
      `backend/.env still has unresolved Supabase settings (${unresolvedVariables
        .map(({ key }) => key)
        .join(", ")}). Update them before expecting a healthy backend. Use \`npm run supabase:status:env\` when working against local Supabase.`,
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
      key: "AGENTRY_API_URL",
      value: envValues.AGENTRY_API_URL ?? "",
      placeholder: "",
    },
    {
      key: "AGENTRY_API_KEY",
      value: envValues.AGENTRY_API_KEY ?? "",
      placeholder: "your-agentry-api-key",
    },
  ].filter(
    ({ key, value, placeholder }) =>
      (key !== "AGENTRY_API_URL" && (value.length === 0 || value.includes(placeholder))) ||
      (key === "AGENTRY_API_URL" && value.length === 0),
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
      ? "Installing Agentry application dependencies from root postinstall."
      : "Installing Agentry application dependencies.",
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
