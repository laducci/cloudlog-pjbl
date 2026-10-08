const { Delivery } = require("../../domain/delivery/Delivery");
const { NotFoundError } = require("../../domain/errors");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: alterar parcialmente uma entrega (RF-03). */
class UpdateDeliveryUseCase {
  constructor({ deliveryUpdater, clock }) {
    this.deliveryUpdater = assertPort("DeliveryUpdater", deliveryUpdater);
    this.clock = assertPort("Clock", clock);
  }

  async execute(id, input) {
    const changes = Delivery.validateChanges(input, this.clock.now());
    const updated = await this.deliveryUpdater.update(id, changes);
    if (!updated) throw new NotFoundError();
    return updated;
  }
}

module.exports = { UpdateDeliveryUseCase };
