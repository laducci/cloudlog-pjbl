const { ServiceBusClient } = require("@azure/service-bus");

/**
 * Adaptador de saída: publica eventos de domínio numa fila do Azure Service Bus.
 * Publicação "best effort": falhas são registradas e não desfazem a operação
 * já persistida (ver débito técnico: Transactional Outbox).
 */
class ServiceBusDeliveryEventPublisher {
  constructor({ connectionString, queueName, logger = console }) {
    this.connectionString = connectionString;
    this.queueName = queueName;
    this.logger = logger;
    this.sender = undefined;
  }

  getSender() {
    if (!this.sender) {
      const client = new ServiceBusClient(this.connectionString);
      this.sender = client.createSender(this.queueName);
    }
    return this.sender;
  }

  async publish(event) {
    try {
      await this.getSender().sendMessages({
        body: event,
        contentType: "application/json",
        subject: event.type,
        applicationProperties: { eventType: event.type, version: event.version },
      });
    } catch (error) {
      this.logger.error?.(`[EventPublisher] falha ao publicar ${event.type}`, error);
    }
  }
}

module.exports = { ServiceBusDeliveryEventPublisher };
