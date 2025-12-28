import { defineConfig } from "tsup";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    "process.env.NPM_PACKAGE_VERSION": JSON.stringify(packageJson.version),
  },
  onSuccess: isDev ? "node dist/index.js" : undefined,
});
