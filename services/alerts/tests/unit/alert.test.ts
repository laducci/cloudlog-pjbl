import { Alert } from "../../src/domain/alert/Alert";
import { ValidationError } from "../../src/domain/errors";
import { delayedEvent, FIXED_NOW } from "../support/fakes";

describe("Entidade Alert e política de atraso", () => {
  it("gera alerta de ATRASO com mensagem para a central", () => {
    const alert = Alert.fromDelayedDelivery(delayedEvent(), "a1", FIXED_NOW).toPrimitives();
    expect(alert).toMatchObject({ id: "a1", type: "ATRASO", severity: "alta", deliveryCode: "CL-2050" });
    expect(alert.message).toBe("Entrega CL-2050 está atrasada (motorista: Marcos Silva).");
  });

  it("só DeliveryCreated/DeliveryUpdated com status Atrasada disparam alerta", () => {
    expect(Alert.shouldRaiseFor(delayedEvent())).toBe(true);
    expect(Alert.shouldRaiseFor(delayedEvent({ data: { status: "Entregue" } }))).toBe(false);
    expect(Alert.shouldRaiseFor(delayedEvent({ type: "DeliveryDeleted" }))).toBe(false);
  });

  it("rejeita evento sem tipo ou sem agregado", () => {
    expect(() => Alert.fromDelayedDelivery({} as never, "a1", FIXED_NOW)).toThrow(ValidationError);
  });
});
