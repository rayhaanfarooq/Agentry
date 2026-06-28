import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.HOST || "0.0.0.0";
  const port = Number(env.PORT || 3000);
  const previewPort = Number(env.PREVIEW_PORT || port);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host,
      port,
      strictPort: true,
    },
    preview: {
      host,
      port: previewPort,
      strictPort: true,
    },
  };
});
