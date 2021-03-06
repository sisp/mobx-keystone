module.exports = {
  inputFiles: ["src/index.ts"],
  module: "commonjs",
  excludeNotExported: true,
  excludePrivate: true,
  excludeProtected: true,
  mode: "file",
  readme: "none",
  out: "../site/public/api",
  tsconfig: "tsconfig.json",
  listInvalidSymbolLinks: true,
}
