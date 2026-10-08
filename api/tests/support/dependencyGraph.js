const fs = require("node:fs");
const path = require("node:path");

const SRC = path.resolve(__dirname, "../../src");
const REQUIRE_PATTERN = /require\(\s*["'`]([^"'`]+)["'`]\s*\)/g;

function listFiles(dir = SRC) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return entry.name.endsWith(".js") ? [full] : [];
  });
}

/** Lê cada arquivo de src/ e extrai suas dependências (internas e pacotes). */
function buildGraph() {
  return listFiles().map((file) => {
    const source = fs.readFileSync(file, "utf8");
    const dependencies = [...source.matchAll(REQUIRE_PATTERN)].map(([, target]) => {
      if (!target.startsWith(".")) return { kind: "package", target };
      const resolved = path.resolve(path.dirname(file), target);
      const withExt = resolved.endsWith(".js") ? resolved : `${resolved}.js`;
      return { kind: "internal", target: path.relative(SRC, withExt).split(path.sep).join("/") };
    });
    return { file: path.relative(SRC, file).split(path.sep).join("/"), dependencies };
  });
}

const layerOf = (relativePath) => relativePath.split("/")[0];
const sliceOf = (relativePath) => (relativePath.startsWith("features/") ? relativePath.split("/")[1] : null);

module.exports = { SRC, buildGraph, layerOf, sliceOf };
