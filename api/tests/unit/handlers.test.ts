import { buildContainer } from "../../src/bootstrap/container";
import { makeCreateDeliveryHandler } from "../../src/features/createDelivery/createDelivery.handler";
import { makeDeleteDeliveryHandler } from "../../src/features/deleteDelivery/deleteDelivery.handler";
import { makeHelloHandler } from "../../src/features/hello/hello.handler";
import { makeSearchDeliveriesHandler } from "../../src/features/searchDeliveries/searchDeliveries.handler";
import { makeUpdateDeliveryHandler } from "../../src/features/updateDelivery/updateDelivery.handler";
import { toHttpError } from "../../src/shared/http/errorMapper";
import { fakeLogger, fakeRequest, validDelivery } from "../support/fakes";

const body = (r: { body: string }) => JSON.parse(r.body);

function handlers() {
  const c = buildContainer({ DELIVERY_REPOSITORY: "memory", EVENT_PUBLISHER: "memory" });
  return {
    create: makeCreateDeliveryHandler(c), search: makeSearchDeliveriesHandler(c),
    update: makeUpdateDeliveryHandler(c), remove: makeDeleteDeliveryHandler(c), hello: makeHelloHandler(c),
  };
}

describe("Contrato HTTP (usado pelo frontend e pelo BFF)", () => {
  it("fluxo CRUD completo com status e JSON UTF-8", async () => {
    const h = handlers();
    const created = await h.create(fakeRequest({ body: validDelivery() }));
    expect(created.status).toBe(201);
    expect(created.headers["Content-Type"]).toBe("application/json; charset=utf-8");
    const { _id } = body(created);
    expect(body(await h.search(fakeRequest({ query: { status: "Em rota" } }))).total).toBe(1);
    expect(body(await h.update(fakeRequest({ params: { id: _id }, body: { status: "Entregue" } }))).status).toBe("Entregue");
    expect(body(await h.remove(fakeRequest({ params: { id: _id } })))).toEqual({ deleted: true, id: _id });
  });

  it("JSON inválido e validação retornam 400; inexistente retorna 404", async () => {
    const h = handlers();
    expect((await h.create(fakeRequest({ invalidJson: true }))).status).toBe(400);
    expect((await h.create(fakeRequest({ body: { code: "X" } }))).status).toBe(400);
    expect((await h.remove(fakeRequest({ params: { id: "x" } }))).status).toBe(404);
  });

  it("erro inesperado vira 500 e é registrado", () => {
    const logger = fakeLogger();
    expect(toHttpError(new Error("timeout"), logger).status).toBe(500);
    expect(logger.errors).toHaveLength(1);
  });

  it("hello mantém a resposta da Entrega 1", async () => {
    expect(body(await handlers().hello(fakeRequest({ query: { name: "Laura" } }))).message)
      .toBe("Olá, Laura! A Azure Function do CloudLog está funcionando.");
  });
});
