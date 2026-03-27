/// <reference types="vitest" />
/// <reference types="vite/client" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { isVirtualPreviewRoute } from "./src/shell/virtualPreviewRoutes";

const rewriteVirtualPreviewRoute = (url: string | undefined) => {
  if (!url) {
    return url;
  }

  const [pathname] = url.split("?");
  return isVirtualPreviewRoute(pathname) ? "/index.html" : url;
};

const virtualPreviewRoutePlugin = () => ({
  name: "virtual-preview-route-fallback",
  configureServer(server: {
    middlewares: {
      use: (handler: (req: { url?: string }, res: unknown, next: () => void) => void) => void;
    };
  }) {
    server.middlewares.use((req, _res, next) => {
      req.url = rewriteVirtualPreviewRoute(req.url);
      next();
    });
  },
  configurePreviewServer(server: {
    middlewares: {
      use: (handler: (req: { url?: string }, res: unknown, next: () => void) => void) => void;
    };
  }) {
    server.middlewares.use((req, _res, next) => {
      req.url = rewriteVirtualPreviewRoute(req.url);
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    virtualPreviewRoutePlugin(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/test/**/*.{spec,test}.{ts,tsx}"],
    exclude: [".claude/**", "dist/**", "node_modules/**"],
    setupFiles: "./src/test/setup.ts",
  },
});
