const { Delivery } = require("../../domain/delivery/Delivery");
const { DeliveryEvents } = require("../../domain/delivery/DeliveryEvents");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: inserir entrega (RF-03) e publicar DeliveryCreated (EDA). */
class CreateDeliveryUseCase {
  constructor({ deliveryWriter, eventPublisher, clock }) {
    this.deliveryWriter = assertPort("DeliveryWriter", deliveryWriter);
    this.eventPublisher = assertPort("DeliveryEventPublisher", eventPublisher);
    this.clock = assertPort("Clock", clock);
  }

  async execute(input) {
    const now = this.clock.now();
    const delivery = Delivery.create(input, now);
    const stored = await this.deliveryWriter.insert(delivery.toPrimitives());
    await this.eventPublisher.publish(DeliveryEvents.created(stored, now));
    return stored;
  }
}

module.exports = { CreateDeliveryUseCase };
