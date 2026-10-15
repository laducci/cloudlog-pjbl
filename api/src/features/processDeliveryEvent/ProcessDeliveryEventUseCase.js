const { DeliveryEventType } = require("../../domain/delivery/DeliveryEvents");
const { DeliveryStatus } = require("../../domain/delivery/DeliveryStatus");
const { ValidationError } = require("../../domain/errors");
const { assertPort } = require("../../domain/ports/deliveryPorts");

const HANDLED = new Set([DeliveryEventType.CREATED, DeliveryEventType.UPDATED]);

/**
 * Caso de uso consumidor (EDA): reage a eventos de entrega e gera alerta
 * para a central quando a entrega fica "Atrasada" (RF-05).
 */
class ProcessDeliveryEventUseCase {
  constructor({ alertNotifier }) {
    this.alertNotifier = assertPort("AlertNotifier", alertNotifier);
  }

  async execute(event) {
    if (!event?.type || !event?.aggregateId) throw new ValidationError("Evento de entrega inválido.");
    if (!HANDLED.has(event.type) || event.data?.status !== DeliveryStatus.DELAYED) {
      return { alerted: false, type: event.type };
    }
    const alert = {
      deliveryId: event.aggregateId,
      code: event.data.code,
      driver: event.data.driver,
      message: `Entrega ${event.data.code} está atrasada (motorista: ${event.data.driver}).`,
      occurredAt: event.occurredAt,
    };
    await this.alertNotifier.notify(alert);
    return { alerted: true, type: event.type, alert };
  }
}

module.exports = { ProcessDeliveryEventUseCase };
