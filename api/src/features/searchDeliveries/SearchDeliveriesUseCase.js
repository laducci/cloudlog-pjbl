const { assertPort } = require("../../domain/ports/deliveryPorts");

const ALL_STATUSES = "Todos";
const MAX_RESULTS = 100;

/** Caso de uso: pesquisar entregas por status e texto livre (RF-03 / SAC). */
class SearchDeliveriesUseCase {
  constructor({ deliveryReader }) {
    this.deliveryReader = assertPort("DeliveryReader", deliveryReader);
  }

  async execute({ status, search } = {}) {
    const criteria = {
      status: status && status !== ALL_STATUSES ? status : undefined,
      text: search || undefined,
      limit: MAX_RESULTS,
    };
    const items = await this.deliveryReader.search(criteria);
    return { items, total: items.length };
  }
}

module.exports = { SearchDeliveriesUseCase, MAX_RESULTS };
