const test = require("node:test");
const assert = require("node:assert/strict");
const { MongoDeliveryRepository } = require("../../src/infrastructure/persistence/mongo/MongoDeliveryRepository");
const { InvalidIdentifierError } = require("../../src/domain/errors");

test("MongoDeliveryRepository converte id inválido em erro de domínio (sem tocar no banco)", async () => {
  const repository = new MongoDeliveryRepository({ connection: { getCollection: () => assert.fail("não deveria conectar") } });
  await assert.rejects(repository.update("123", { status: "Entregue" }), InvalidIdentifierError);
  await assert.rejects(repository.remove("abc"), InvalidIdentifierError);
});

test("MongoDeliveryRepository monta filtro com regex escapada e limite", async () => {
  let captured;
  const cursor = { sort() { return this; }, limit(n) { captured.limit = n; return this; }, toArray: async () => [] };
  const collection = { find(filter) { captured = { filter }; return cursor; } };
  const repository = new MongoDeliveryRepository({ connection: { getCollection: async () => collection } });

  await repository.search({ status: "Em rota", text: "CL.20", limit: 100 });
  assert.equal(captured.filter.status, "Em rota");
  assert.equal(captured.filter.$or[0].code.$regex, "CL\\.20");
  assert.equal(captured.limit, 100);
});
