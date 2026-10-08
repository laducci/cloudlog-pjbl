const test = require("node:test");
const assert = require("node:assert/strict");
const { Delivery } = require("../../src/domain/delivery/Delivery");
const { DeliveryStatus } = require("../../src/domain/delivery/DeliveryStatus");
const { ValidationError } = require("../../src/domain/errors");
const { FIXED_NOW, validDelivery } = require("../support/fakes");

test("Delivery.create normaliza textos e define datas", () => {
  const delivery = Delivery.create({ ...validDelivery(), customer: "  Mercado Aurora  " }, FIXED_NOW);
  assert.equal(delivery.customer, "Mercado Aurora");
  assert.equal(delivery.createdAt, FIXED_NOW);
  assert.equal(delivery.updatedAt, FIXED_NOW);
});

test("Delivery.create rejeita campos obrigatórios ausentes", () => {
  assert.throws(() => Delivery.create({ code: "CL-1" }, FIXED_NOW), (error) =>
    error instanceof ValidationError && /customer, destination, driver, status, eta/.test(error.message));
});

test("Delivery.create rejeita status fora do domínio", () => {
  assert.throws(() => Delivery.create({ ...validDelivery(), status: "Perdida" }, FIXED_NOW), /Status inválido/);
});

test("Delivery rejeita progresso fora de 0..100", () => {
  assert.throws(() => Delivery.create({ ...validDelivery(), progress: 120 }, FIXED_NOW), /Progresso/);
  assert.throws(() => Delivery.validateChanges({ progress: -1 }, FIXED_NOW), /Progresso/);
});

test("Delivery.validateChanges exige ao menos um campo", () => {
  assert.throws(() => Delivery.validateChanges({}, FIXED_NOW), /ao menos um campo/);
});

test("Delivery.validateChanges retorna somente campos alterados + updatedAt", () => {
  const changes = Delivery.validateChanges({ status: "Entregue", progress: "100" }, FIXED_NOW);
  assert.deepEqual(changes, { status: "Entregue", progress: 100, updatedAt: FIXED_NOW });
});

test("DeliveryStatus expõe os quatro status do CloudLog", () => {
  assert.deepEqual(DeliveryStatus.values(), ["Pendente", "Em rota", "Atrasada", "Entregue"]);
});
