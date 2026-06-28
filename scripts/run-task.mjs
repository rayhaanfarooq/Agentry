import { apps, getApp } from "./config.mjs";
import {
  getNpmCommand,
  logError,
  logInfo,
  resolveVenvPython,
  runCommand,
} from "./utils.mjs";

const task = process.argv[2];
const requestedApps = process.argv.slice(3);

const selectedApps =
  requestedApps.length > 0 ? requestedApps.map((appKey) => getApp(appKey)) : apps;

function getPythonExecutable(app) {
  const python = resolveVenvPython(app.cwd);

  if (!python) {
    throw new Error(
      `${app.label}/.venv is missing. Run \`npm install\` or \`npm run setup\` first.`,
    );
  }

  return python;
}

function getCommandsForTask(app) {
  switch (task) {
    case "lint":
      if (app.runtime === "python") {
        return [
          {
            command: getPythonExecutable(app),
            args: ["-m", "ruff", "check", "."],
          },
        ];
      }

      return [
        {
          command: getNpmCommand(),
          args: ["run", "lint"],
        },
      ];

    case "format":
      if (app.runtime === "python") {
        return [
          {
            command: getPythonExecutable(app),
            args: ["-m", "ruff", "check", "--fix", "."],
          },
          {
            command: getPythonExecutable(app),
            args: ["-m", "black", "."],
          },
        ];
      }

      return [
        {
          command: getNpmCommand(),
          args: ["run", "format"],
        },
      ];

    case "typecheck":
      if (app.runtime === "python") {
        return [
          {
            command: getPythonExecutable(app),
            args: ["-m", "mypy", "."],
          },
        ];
      }

      return [
        {
          command: getNpmCommand(),
          args: ["run", "typecheck"],
        },
      ];

    case "test":
      if (app.runtime === "python") {
        return [
          {
            command: getPythonExecutable(app),
            args: ["-m", "pytest"],
          },
        ];
      }

      return [
        {
          command: getNpmCommand(),
          args: ["run", "test"],
        },
      ];

    default:
      throw new Error(
        `Unknown task "${task}". Expected one of: lint, format, typecheck, test.`,
      );
  }
}

async function main() {
  logInfo(`Running ${task} across ${selectedApps.map((app) => app.label).join(", ")}.`);

  for (const app of selectedApps) {
    for (const command of getCommandsForTask(app)) {
      await runCommand({
        label: app.label,
        color: app.color,
        cwd: app.cwd,
        command: command.command,
        args: command.args,
      });
    }
  }

  logInfo(`${task} completed successfully.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown task failure.";
  logError(message);
  process.exit(1);
});
