import { Delivery } from "../../src/domain/delivery/Delivery";
import { deliveryStatusValues } from "../../src/domain/delivery/DeliveryStatus";
import { ValidationError } from "../../src/domain/errors";
import { FIXED_NOW, validDelivery } from "../support/fakes";

describe("Entidade Delivery", () => {
  it("normaliza textos e define as datas", () => {
    const delivery = Delivery.create({ ...validDelivery(), customer: "  Mercado Aurora  " }, FIXED_NOW).toPrimitives();
    expect(delivery.customer).toBe("Mercado Aurora");
    expect(delivery.createdAt).toBe(FIXED_NOW);
  });

  it("rejeita campos obrigatórios ausentes", () => {
    expect(() => Delivery.create({ code: "CL-1" }, FIXED_NOW)).toThrow(/customer, destination, driver, status, eta/);
  });

  it("rejeita status fora do domínio", () => {
    expect(() => Delivery.create({ ...validDelivery(), status: "Perdida" }, FIXED_NOW)).toThrow(ValidationError);
  });

  it("rejeita progresso fora de 0..100", () => {
    expect(() => Delivery.create({ ...validDelivery(), progress: 120 }, FIXED_NOW)).toThrow(/Progresso/);
  });

  it("validateChanges devolve só os campos alterados + updatedAt", () => {
    expect(Delivery.validateChanges({ status: "Entregue", progress: "100" }, FIXED_NOW))
      .toEqual({ status: "Entregue", progress: 100, updatedAt: FIXED_NOW });
    expect(() => Delivery.validateChanges({}, FIXED_NOW)).toThrow(/ao menos um campo/);
  });

  it("expõe os quatro status do CloudLog", () => {
    expect(deliveryStatusValues()).toEqual(["Pendente", "Em rota", "Atrasada", "Entregue"]);
  });
});
