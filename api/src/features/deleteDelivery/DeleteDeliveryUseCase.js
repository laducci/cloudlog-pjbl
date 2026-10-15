const { DeliveryEvents } = require("../../domain/delivery/DeliveryEvents");
const { NotFoundError } = require("../../domain/errors");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: excluir entrega (RF-03) e publicar DeliveryDeleted (EDA). */
class DeleteDeliveryUseCase {
  constructor({ deliveryRemover, eventPublisher, clock }) {
    this.deliveryRemover = assertPort("DeliveryRemover", deliveryRemover);
    this.eventPublisher = assertPort("DeliveryEventPublisher", eventPublisher);
    this.clock = assertPort("Clock", clock);
  }

  async execute(id) {
    const removed = await this.deliveryRemover.remove(id);
    if (!removed) throw new NotFoundError();
    await this.eventPublisher.publish(DeliveryEvents.deleted(id, this.clock.now()));
    return { deleted: true, id };
  }
}

module.exports = { DeleteDeliveryUseCase };
