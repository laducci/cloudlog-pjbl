const { Delivery } = require("../../domain/delivery/Delivery");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: inserir entrega (RF-03). */
class CreateDeliveryUseCase {
  constructor({ deliveryWriter, clock }) {
    this.deliveryWriter = assertPort("DeliveryWriter", deliveryWriter);
    this.clock = assertPort("Clock", clock);
  }

  async execute(input) {
    const delivery = Delivery.create(input, this.clock.now());
    return this.deliveryWriter.insert(delivery.toPrimitives());
  }
}

module.exports = { CreateDeliveryUseCase };
