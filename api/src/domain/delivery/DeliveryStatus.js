const { ValidationError } = require("../errors");

/**
 * Value Object: status permitido para uma entrega.
 */
class DeliveryStatus {
  static PENDING = "Pendente";
  static IN_ROUTE = "Em rota";
  static DELAYED = "Atrasada";
  static DELIVERED = "Entregue";

  static values() {
    return [DeliveryStatus.PENDING, DeliveryStatus.IN_ROUTE, DeliveryStatus.DELAYED, DeliveryStatus.DELIVERED];
  }

  static isValid(value) {
    return DeliveryStatus.values().includes(value);
  }

  static assertValid(value) {
    if (!DeliveryStatus.isValid(value)) throw new ValidationError("Status inválido.");
    return value;
  }
}

module.exports = { DeliveryStatus };
