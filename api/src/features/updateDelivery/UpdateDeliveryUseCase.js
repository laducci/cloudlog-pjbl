const { Delivery } = require("../../domain/delivery/Delivery");
const { DeliveryEvents } = require("../../domain/delivery/DeliveryEvents");
const { NotFoundError } = require("../../domain/errors");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: alterar parcialmente uma entrega (RF-03) e publicar DeliveryUpdated (EDA). */
class UpdateDeliveryUseCase {
  constructor({ deliveryUpdater, eventPublisher, clock }) {
    this.deliveryUpdater = assertPort("DeliveryUpdater", deliveryUpdater);
    this.eventPublisher = assertPort("DeliveryEventPublisher", eventPublisher);
    this.clock = assertPort("Clock", clock);
  }

  async execute(id, input) {
    const now = this.clock.now();
    const changes = Delivery.validateChanges(input, now);
    const updated = await this.deliveryUpdater.update(id, changes);
    if (!updated) throw new NotFoundError();
    await this.eventPublisher.publish(DeliveryEvents.updated(updated, changes, now));
    return updated;
  }
}

module.exports = { UpdateDeliveryUseCase };
