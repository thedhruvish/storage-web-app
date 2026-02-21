import esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { createRequire } from "module";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);
const lambdas = ["lambda-api-server", "lambda-auth-server", "lambda-image-resize"];

await Promise.all(
  lambdas.map((name) =>
    esbuild.build({
      entryPoints: [`${name}.js`],
      bundle: true,
      platform: "node",
      target: "node24",
      format: "esm",
      outfile: `dist/${name}.mjs`,
      minify: true,
      treeShaking: true,
      external: ["sharp"],
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`,
      },
    })
  )
);

// Auto-find xhr-sync-worker.js regardless of jsdom version
mkdirSync("dist", { recursive: true });

const workerPath = execSync("find node_modules/jsdom -name 'xhr-sync-worker.js' 2>/dev/null")
  .toString()
  .trim()
  .split("\n")[0]; // take first result

if (workerPath && existsSync(workerPath)) {
  copyFileSync(workerPath, "dist/xhr-sync-worker.js");
  console.log(`✅ Copied xhr-sync-worker from: ${workerPath}`);
} else {
  console.log("⚠️  xhr-sync-worker.js not found — jsdom version may not need it");
}

console.log("✅ Lambdas built successfully");