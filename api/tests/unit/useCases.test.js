const test = require("node:test");
const assert = require("node:assert/strict");
const { CreateDeliveryUseCase } = require("../../src/features/createDelivery/CreateDeliveryUseCase");
const { SearchDeliveriesUseCase } = require("../../src/features/searchDeliveries/SearchDeliveriesUseCase");
const { UpdateDeliveryUseCase } = require("../../src/features/updateDelivery/UpdateDeliveryUseCase");
const { DeleteDeliveryUseCase } = require("../../src/features/deleteDelivery/DeleteDeliveryUseCase");
const { SayHelloUseCase } = require("../../src/features/hello/SayHelloUseCase");
const { InMemoryDeliveryRepository } = require("../../src/infrastructure/persistence/memory/InMemoryDeliveryRepository");
const { NotFoundError } = require("../../src/domain/errors");
const { fixedClock, FIXED_NOW, validDelivery } = require("../support/fakes");

function setup() {
  const repository = new InMemoryDeliveryRepository();
  return {
    repository,
    create: new CreateDeliveryUseCase({ deliveryWriter: repository, clock: fixedClock }),
    search: new SearchDeliveriesUseCase({ deliveryReader: repository }),
    update: new UpdateDeliveryUseCase({ deliveryUpdater: repository, clock: fixedClock }),
    remove: new DeleteDeliveryUseCase({ deliveryRemover: repository }),
  };
}

test("CreateDelivery persiste e devolve a entrega com _id", async () => {
  const { create, repository } = setup();
  const created = await create.execute(validDelivery());
  assert.ok(created._id);
  assert.equal(created.code, "CL-2050");
  assert.equal(repository.items.length, 1);
});

test("SearchDeliveries filtra por status e texto e ignora 'Todos'", async () => {
  const { create, search } = setup();
  await create.execute(validDelivery());
  await create.execute({ ...validDelivery(), code: "CL-3000", status: "Atrasada", customer: "Farmácia Sol" });

  assert.equal((await search.execute({ status: "Todos" })).total, 2);
  assert.equal((await search.execute({ status: "Atrasada" })).total, 1);
  assert.equal((await search.execute({ search: "aurora" })).items[0].code, "CL-2050");
});

test("UpdateDelivery altera campos e atualiza updatedAt", async () => {
  const { create, update } = setup();
  const created = await create.execute(validDelivery());
  const updated = await update.execute(created._id, { status: "Entregue", progress: 100 });
  assert.equal(updated.status, "Entregue");
  assert.equal(updated.updatedAt, FIXED_NOW);
});

test("UpdateDelivery lança NotFoundError para id inexistente", async () => {
  const { update } = setup();
  await assert.rejects(update.execute("nao-existe", { status: "Entregue" }), NotFoundError);
});

test("DeleteDelivery remove e lança NotFoundError na segunda tentativa", async () => {
  const { create, remove } = setup();
  const created = await create.execute(validDelivery());
  assert.deepEqual(await remove.execute(created._id), { deleted: true, id: created._id });
  await assert.rejects(remove.execute(created._id), NotFoundError);
});

test("Casos de uso recusam dependências que não cumprem a porta (LSP/DIP)", () => {
  assert.throws(() => new CreateDeliveryUseCase({ deliveryWriter: {}, clock: fixedClock }), /DeliveryWriter inválido/);
  assert.throws(() => new SearchDeliveriesUseCase({ deliveryReader: { find() {} } }), /DeliveryReader inválido/);
});

test("SayHello usa 'visitante' quando não há nome", () => {
  const hello = new SayHelloUseCase({ clock: fixedClock });
  assert.match(hello.execute({}).message, /Olá, visitante!/);
  assert.equal(hello.execute({ name: "Laura" }).timestamp, FIXED_NOW.toISOString());
});
