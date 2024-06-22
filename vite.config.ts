import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remixDevTools(),
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    target: "ES2022",
  },
});
