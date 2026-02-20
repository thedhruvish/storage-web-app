import esbuild from "esbuild";

const lambdas = [
  "lambda-api-server",
  "lambda-auth-server",
  "lambda-image-resize",
];

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
      minifyWhitespace: true,
      treeShaking: true,
      external: ["sharp"],
    }),
  ),
);

console.log("✅ Lambdas built successfully");
