const { NotFoundError } = require("../../domain/errors");
const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso: excluir entrega (RF-03). */
class DeleteDeliveryUseCase {
  constructor({ deliveryRemover }) {
    this.deliveryRemover = assertPort("DeliveryRemover", deliveryRemover);
  }

  async execute(id) {
    const removed = await this.deliveryRemover.remove(id);
    if (!removed) throw new NotFoundError();
    return { deleted: true, id };
  }
}

module.exports = { DeleteDeliveryUseCase };
