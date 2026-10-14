/** Publicador usado quando o Service Bus não está configurado: apenas registra o evento. */
class LoggingEventPublisher {
  constructor({ logger = console } = {}) {
    this.logger = logger;
  }

  async publish(event) {
    this.logger.info?.(`[EventPublisher] ${event.type} ${event.aggregateId}`);
  }
}

module.exports = { LoggingEventPublisher };
