/** Publicador em memória (testes e execução local): guarda os eventos publicados. */
class InMemoryEventPublisher {
  constructor() {
    this.events = [];
  }

  async publish(event) {
    this.events.push(event);
  }
}

module.exports = { InMemoryEventPublisher };
