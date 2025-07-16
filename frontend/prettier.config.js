//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  bracketSpacing: true,
  useTabs: false,
  jsxSingleQuote: true,
  tabWidth: 2,
  endOfLine: "lf",

  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
