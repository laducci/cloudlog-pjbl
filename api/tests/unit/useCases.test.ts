import { DeliveryEventType } from "../../src/domain/delivery/DeliveryEvents";
import { NotFoundError } from "../../src/domain/errors";
import { CreateDeliveryUseCase } from "../../src/features/createDelivery/CreateDeliveryUseCase";
import { DeleteDeliveryUseCase } from "../../src/features/deleteDelivery/DeleteDeliveryUseCase";
import { SayHelloUseCase } from "../../src/features/hello/SayHelloUseCase";
import { SearchDeliveriesUseCase } from "../../src/features/searchDeliveries/SearchDeliveriesUseCase";
import { UpdateDeliveryUseCase } from "../../src/features/updateDelivery/UpdateDeliveryUseCase";
import { InMemoryEventPublisher } from "../../src/infrastructure/messaging/InMemoryEventPublisher";
import { InMemoryDeliveryRepository } from "../../src/infrastructure/persistence/memory/InMemoryDeliveryRepository";
import { FIXED_NOW, fixedClock, validDelivery } from "../support/fakes";

function setup() {
  const repository = new InMemoryDeliveryRepository();
  const eventPublisher = new InMemoryEventPublisher();
  const deps = { eventPublisher, clock: fixedClock };
  return {
    repository,
    eventPublisher,
    create: new CreateDeliveryUseCase({ deliveryWriter: repository, ...deps }),
    search: new SearchDeliveriesUseCase({ deliveryReader: repository }),
    update: new UpdateDeliveryUseCase({ deliveryUpdater: repository, ...deps }),
    remove: new DeleteDeliveryUseCase({ deliveryRemover: repository, ...deps }),
  };
}

describe("Casos de uso das fatias verticais", () => {
  it("CreateDelivery persiste e devolve a entrega com _id", async () => {
    const { create, repository } = setup();
    const created = await create.execute(validDelivery());
    expect(created._id).toBeTruthy();
    expect(repository.items).toHaveLength(1);
  });

  it("SearchDeliveries filtra por status e texto e ignora 'Todos'", async () => {
    const { create, search } = setup();
    await create.execute(validDelivery());
    await create.execute({ ...validDelivery(), code: "CL-3000", status: "Atrasada" });
    expect((await search.execute({ status: "Todos" })).total).toBe(2);
    expect((await search.execute({ status: "Atrasada" })).total).toBe(1);
    expect((await search.execute({ search: "aurora" })).total).toBe(2);
  });

  it("UpdateDelivery altera e lança NotFoundError para id inexistente", async () => {
    const { create, update } = setup();
    const created = await create.execute(validDelivery());
    expect((await update.execute(created._id!, { status: "Entregue" })).status).toBe("Entregue");
    await expect(update.execute("nao-existe", { status: "Entregue" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("DeleteDelivery remove e falha na segunda tentativa", async () => {
    const { create, remove } = setup();
    const created = await create.execute(validDelivery());
    expect(await remove.execute(created._id!)).toEqual({ deleted: true, id: created._id });
    await expect(remove.execute(created._id!)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("EDA: create, update e delete publicam eventos na ordem", async () => {
    const { create, update, remove, eventPublisher } = setup();
    const created = await create.execute(validDelivery());
    await update.execute(created._id!, { status: "Atrasada" });
    await remove.execute(created._id!);
    expect(eventPublisher.events.map((e) => e.type)).toEqual([DeliveryEventType.CREATED, DeliveryEventType.UPDATED, DeliveryEventType.DELETED]);
    expect(eventPublisher.events[1].data.changedFields).toEqual(["status", "updatedAt"]);
    expect(eventPublisher.events[0].occurredAt).toBe(FIXED_NOW.toISOString());
  });

  it("EDA: nenhum evento é publicado quando a operação falha", async () => {
    const { update, remove, eventPublisher } = setup();
    await expect(update.execute("x", { status: "Entregue" })).rejects.toThrow();
    await expect(remove.execute("x")).rejects.toThrow();
    expect(eventPublisher.events).toHaveLength(0);
  });

  it("SayHello usa 'visitante' quando não há nome", () => {
    const hello = new SayHelloUseCase({ clock: fixedClock });
    expect(hello.execute({}).message).toMatch(/Olá, visitante!/);
  });
});
