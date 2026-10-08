/**
 * Testes unitários de ARQUITETURA (estilo ArchUnit) do backend CloudLog.
 * Eles quebram o build se alguém violar a Regra de Dependência da
 * Clean Architecture ou o isolamento entre fatias verticais.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { SRC, buildGraph, layerOf, sliceOf } = require("../support/dependencyGraph");

const graph = buildGraph();
const NODE_BUILTINS = new Set(require("node:module").builtinModules.flatMap((m) => [m, `node:${m}`]));

function violations(predicate, rule) {
  return graph.flatMap(({ file, dependencies }) =>
    dependencies.filter((dep) => predicate(file, dep)).map((dep) => `${file} -> ${dep.target} (${rule})`));
}

test("Domínio é independente: só depende de si mesmo (nenhum pacote, framework ou camada externa)", () => {
  const found = violations(
    (file, dep) => layerOf(file) === "domain" && (dep.kind === "package" || layerOf(dep.target) !== "domain"),
    "domain deve ser puro",
  );
  assert.deepEqual(found, []);
});

test("Casos de uso dependem apenas do domínio (sem HTTP, Azure ou MongoDB)", () => {
  const found = violations(
    (file, dep) => /UseCase\.js$/.test(file) && (dep.kind === "package" || layerOf(dep.target) !== "domain"),
    "use case só conhece domínio/portas",
  );
  assert.deepEqual(found, []);
});

test("Fatias verticais não dependem umas das outras", () => {
  const found = violations(
    (file, dep) => dep.kind === "internal" && sliceOf(file) && sliceOf(dep.target) && sliceOf(file) !== sliceOf(dep.target),
    "slice isolado",
  );
  assert.deepEqual(found, []);
});

test("Infraestrutura não conhece features, HTTP nem bootstrap", () => {
  const found = violations(
    (file, dep) => layerOf(file) === "infrastructure" && dep.kind === "internal"
      && ["features", "shared", "bootstrap"].includes(layerOf(dep.target)),
    "infra aponta para dentro (domain) apenas",
  );
  assert.deepEqual(found, []);
});

test("shared/http não depende de features, infraestrutura ou bootstrap", () => {
  const found = violations(
    (file, dep) => layerOf(file) === "shared" && dep.kind === "internal"
      && ["features", "infrastructure", "bootstrap"].includes(layerOf(dep.target)),
    "shared é transversal",
  );
  assert.deepEqual(found, []);
});

test("Pacote 'mongodb' só é usado no adaptador de persistência Mongo", () => {
  const found = violations(
    (file, dep) => dep.kind === "package" && dep.target === "mongodb" && !file.startsWith("infrastructure/persistence/mongo/"),
    "mongodb confinado",
  );
  assert.deepEqual(found, []);
});

test("Pacote '@azure/functions' só é usado nos arquivos *.function.js", () => {
  const found = violations(
    (file, dep) => dep.kind === "package" && dep.target === "@azure/functions" && !file.endsWith(".function.js"),
    "Azure confinado ao registro da função",
  );
  assert.deepEqual(found, []);
});

test("Somente o Composition Root (bootstrap) instancia a infraestrutura", () => {
  const found = violations(
    (file, dep) => dep.kind === "internal" && layerOf(dep.target) === "infrastructure"
      && !["bootstrap", "infrastructure"].includes(layerOf(file)),
    "DIP: dependência concreta só no bootstrap",
  );
  assert.deepEqual(found, []);
});

test("Nenhum pacote externo além dos declarados no package.json", () => {
  const declared = Object.keys(require("../../package.json").dependencies);
  const found = violations(
    (file, dep) => dep.kind === "package" && !NODE_BUILTINS.has(dep.target)
      && !declared.some((name) => dep.target === name || dep.target.startsWith(`${name}/`)),
    "dependência não declarada",
  );
  assert.deepEqual(found, []);
});

test("Cada fatia vertical tem UseCase, handler e function", () => {
  const slicesDir = path.join(SRC, "features");
  for (const slice of fs.readdirSync(slicesDir)) {
    const files = fs.readdirSync(path.join(slicesDir, slice));
    assert.ok(files.some((f) => f.endsWith("UseCase.js")), `${slice} sem UseCase`);
    assert.ok(files.some((f) => f.endsWith(".handler.js")), `${slice} sem handler`);
    assert.ok(files.some((f) => f.endsWith(".function.js")), `${slice} sem function`);
  }
});

test("index.js registra todas as fatias verticais", () => {
  const index = fs.readFileSync(path.join(SRC, "index.js"), "utf8");
  for (const slice of fs.readdirSync(path.join(SRC, "features"))) {
    assert.match(index, new RegExp(`features/${slice}/`), `${slice} não registrado no index.js`);
  }
});
