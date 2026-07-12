import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isGithubPages = process.env.GITHUB_PAGES === "true";

  return {
    base: isGithubPages ? "/talab-connect/" : "/",
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": `${process.cwd()}/src`,
      },
    },
    plugins: [
      // TanStack Start (router) JSX dan oldin bo'lishi shart
      tanstackStart({
        server: { entry: "server" },
        prerender: isGithubPages
          ? {
              enabled: true,
            }
          : undefined,
      }),
      tailwindcss(),
      viteReact(),
    ].filter(Boolean),
    server: {
      host: "::",
      port: 8080,
    },
  };
});
