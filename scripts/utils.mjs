import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const RESET = "\u001b[0m";
const DIM = "\u001b[2m";
const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const CYAN = "\u001b[36m";

export function supportsColor() {
  return Boolean(process.stdout.isTTY);
}

export function colorize(value, color) {
  if (!supportsColor()) {
    return value;
  }

  return `${color}${value}${RESET}`;
}

export function logInfo(message) {
  process.stdout.write(`${colorize("[runloop]", CYAN)} ${message}\n`);
}

export function logWarning(message) {
  process.stderr.write(`${colorize("[runloop]", YELLOW)} ${message}\n`);
}

export function logError(message) {
  process.stderr.write(`${colorize("[runloop]", RED)} ${message}\n`);
}

export function formatPrefix(label, color) {
  return colorize(`[${label}]`, color);
}

function pipeWithPrefix(stream, target, prefix) {
  if (!stream) {
    return;
  }

  stream.setEncoding("utf8");

  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk;

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      target.write(`${prefix} ${line}\n`);
    }
  });

  stream.on("end", () => {
    if (buffer.length > 0) {
      target.write(`${prefix} ${buffer}\n`);
    }
  });
}

export function spawnWithPrefix({
  label,
  color,
  cwd,
  command,
  args,
  env,
}) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["inherit", "pipe", "pipe"],
  });

  const prefix = formatPrefix(label, color);
  pipeWithPrefix(child.stdout, process.stdout, prefix);
  pipeWithPrefix(child.stderr, process.stderr, prefix);

  return child;
}

export function runCommand({
  label,
  color,
  cwd,
  command,
  args,
  env,
}) {
  return new Promise((resolve, reject) => {
    const child = spawnWithPrefix({
      label,
      color,
      cwd,
      command,
      args,
      env,
    });

    child.once("error", (error) => {
      reject(error);
    });

    child.once("close", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const reason =
        signal !== null
          ? `signal ${signal}`
          : `exit code ${code ?? "unknown"}`;

      reject(new Error(`${label} command failed with ${reason}.`));
    });
  });
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function ensureEnvFile(envExampleFile, envFile) {
  if (fileExists(envFile) || !fileExists(envExampleFile)) {
    return false;
  }

  fs.copyFileSync(envExampleFile, envFile);
  return true;
}

export function parseEnvFile(filePath) {
  if (!fileExists(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const values = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const normalizedValue = rawValue.replace(/^['"]|['"]$/g, "");

    values[key] = normalizedValue;
  }

  return values;
}

export function readEnvValue(app, key) {
  const envValues = parseEnvFile(app.envFile);
  if (envValues[key]) {
    return envValues[key];
  }

  const exampleValues = parseEnvFile(app.envExampleFile);
  return exampleValues[key];
}

export function getAppHost(app) {
  return readEnvValue(app, "HOST") || app.defaultHost;
}

export function getAppPort(app) {
  return readEnvValue(app, "PORT") || app.defaultPort;
}

export function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

export function resolveVenvPython(cwd) {
  const candidates = [
    path.join(cwd, ".venv", "bin", "python"),
    path.join(cwd, ".venv", "Scripts", "python.exe"),
  ];

  return candidates.find((candidate) => fileExists(candidate)) ?? null;
}

export function resolveSystemPython() {
  const candidates = process.platform === "win32" ? ["py", "python"] : ["python3", "python"];

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], {
      stdio: "ignore",
    });

    if (result.status === 0) {
      return candidate;
    }
  }

  return null;
}

export function ensureDirectory(filePath) {
  fs.mkdirSync(filePath, { recursive: true });
}

export function setExecutable(filePath) {
  if (process.platform === "win32") {
    return;
  }

  fs.chmodSync(filePath, 0o755);
}

export function dim(value) {
  return colorize(value, DIM);
}
