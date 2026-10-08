const test = require("node:test");
const assert = require("node:assert/strict");
const { buildContainer } = require("../../src/bootstrap/container");
const { makeCreateDeliveryHandler } = require("../../src/features/createDelivery/createDelivery.handler");
const { makeSearchDeliveriesHandler } = require("../../src/features/searchDeliveries/searchDeliveries.handler");
const { makeUpdateDeliveryHandler } = require("../../src/features/updateDelivery/updateDelivery.handler");
const { makeDeleteDeliveryHandler } = require("../../src/features/deleteDelivery/deleteDelivery.handler");
const { makeHelloHandler } = require("../../src/features/hello/hello.handler");
const { toHttpError } = require("../../src/shared/http/errorMapper");
const { fakeRequest, fakeContext, validDelivery } = require("../support/fakes");

const body = (response) => JSON.parse(response.body);

function handlers() {
  const container = buildContainer({ DELIVERY_REPOSITORY: "memory" });
  return {
    create: makeCreateDeliveryHandler(container),
    search: makeSearchDeliveriesHandler(container),
    update: makeUpdateDeliveryHandler(container),
    remove: makeDeleteDeliveryHandler(container),
    hello: makeHelloHandler(container),
  };
}

test("Fluxo CRUD completo mantém o contrato HTTP usado pelo frontend", async () => {
  const h = handlers();
  const created = await h.create(fakeRequest({ body: validDelivery() }), fakeContext());
  assert.equal(created.status, 201);
  assert.equal(created.headers["Content-Type"], "application/json; charset=utf-8");
  const { _id } = body(created);

  const listed = await h.search(fakeRequest({ query: { status: "Em rota", search: "CL" } }), fakeContext());
  assert.equal(listed.status, 200);
  assert.equal(body(listed).total, 1);

  const updated = await h.update(fakeRequest({ params: { id: _id }, body: { status: "Entregue" } }), fakeContext());
  assert.equal(body(updated).status, "Entregue");

  const deleted = await h.remove(fakeRequest({ params: { id: _id } }), fakeContext());
  assert.deepEqual(body(deleted), { deleted: true, id: _id });
});

test("JSON inválido retorna 400 com mensagem amigável", async () => {
  const response = await handlers().create(fakeRequest({ invalidJson: true }), fakeContext());
  assert.equal(response.status, 400);
  assert.equal(body(response).message, "O corpo da requisição deve ser um JSON válido.");
});

test("Erro de validação retorna 400 e entrega inexistente retorna 404", async () => {
  const h = handlers();
  assert.equal((await h.create(fakeRequest({ body: { code: "X" } }), fakeContext())).status, 400);
  assert.equal((await h.remove(fakeRequest({ params: { id: "x" } }), fakeContext())).status, 404);
});

test("Erro inesperado vira 500 e é registrado no log", () => {
  const context = fakeContext();
  const response = toHttpError(new Error("timeout"), context);
  assert.equal(response.status, 500);
  assert.equal(context.errors.length, 1);
});

test("Endpoint hello mantém a resposta da Entrega 1", async () => {
  const response = await handlers().hello(fakeRequest({ query: { name: "Laura" } }));
  assert.equal(body(response).message, "Olá, Laura! A Azure Function do CloudLog está funcionando.");
  assert.equal(body(response).service, "CloudLog API");
});
