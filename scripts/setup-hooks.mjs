import { execFileSync } from "node:child_process";
import path from "node:path";

import { rootDir } from "./config.mjs";
import { fileExists, logInfo, logWarning, setExecutable } from "./utils.mjs";

function main() {
  const gitDirectory = path.join(rootDir, ".git");
  const hookFile = path.join(rootDir, ".githooks", "pre-commit");

  if (!fileExists(gitDirectory) || !fileExists(hookFile)) {
    return;
  }

  setExecutable(hookFile);

  try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
      cwd: rootDir,
      stdio: "ignore",
    });
    logInfo("Git hooks configured to use .githooks.");
  } catch (error) {
    logWarning("Unable to configure Git hooks automatically. Run `git config core.hooksPath .githooks` if needed.");
  }
}

main();
