import { vitePlugin as remix } from "@remix-run/dev";
import { remixDevTools } from "remix-development-tools";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true;
  }
}

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remixDevTools(),
    remix({
      ignoredRouteFiles: ["**/.*"],
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            "**/.*",
            "**/*.test.{ts,tsx,js,jsx}",
            "**/*.spec.{ts,tsx,js,jsx}",
            "**/test/**",
          ],
        });
      },
      future: {
        unstable_singleFetch: true,
        unstable_lazyRouteDiscovery: true,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    target: "ES2022",
  },
});
