import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = fileURLToPath(new URL("../", import.meta.url));

export const apps = [
  {
    key: "backend",
    label: "backend",
    runtime: "python",
    cwd: path.join(rootDir, "backend"),
    envFile: path.join(rootDir, "backend", ".env"),
    envExampleFile: path.join(rootDir, "backend", ".env.example"),
    defaultPort: "8000",
    defaultHost: "0.0.0.0",
    color: "\u001b[36m",
  },
  {
    key: "frontend",
    label: "frontend",
    runtime: "node",
    cwd: path.join(rootDir, "frontend"),
    envFile: path.join(rootDir, "frontend", ".env"),
    envExampleFile: path.join(rootDir, "frontend", ".env.example"),
    defaultPort: "5173",
    defaultHost: "0.0.0.0",
    color: "\u001b[32m",
  },
  {
    key: "landing",
    label: "landing",
    runtime: "node",
    cwd: path.join(rootDir, "landingpage"),
    envFile: path.join(rootDir, "landingpage", ".env"),
    envExampleFile: path.join(rootDir, "landingpage", ".env.example"),
    defaultPort: "3000",
    defaultHost: "0.0.0.0",
    color: "\u001b[35m",
  },
  {
    key: "dummy-agent",
    label: "dummy-agent",
    runtime: "python",
    cwd: path.join(rootDir, "dummy-agent"),
    envFile: path.join(rootDir, "dummy-agent", ".env"),
    envExampleFile: path.join(rootDir, "dummy-agent", ".env.example"),
    defaultPort: null,
    defaultHost: null,
    color: "\u001b[33m",
    includeInDefaultDev: false,
    allowNormalExit: true,
  },
  {
    key: "sdk-python",
    label: "sdk-python",
    runtime: "python",
    cwd: path.join(rootDir, "sdk", "python"),
    envFile: path.join(rootDir, "sdk", "python", ".env"),
    envExampleFile: path.join(rootDir, "sdk", "python", ".env.example"),
    defaultPort: null,
    defaultHost: null,
    color: "\u001b[34m",
    includeInDefaultDev: false,
  },
];

export const appMap = new Map(apps.map((app) => [app.key, app]));

export function getApp(key) {
  const app = appMap.get(key);

  if (!app) {
    throw new Error(`Unknown app "${key}".`);
  }

  return app;
}
