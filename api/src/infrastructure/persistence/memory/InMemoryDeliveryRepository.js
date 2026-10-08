const { randomUUID } = require("node:crypto");

/**
 * Implementação alternativa das mesmas portas, em memória.
 * Usada nos testes e no modo local sem banco; prova a substituição (LSP).
 */
class InMemoryDeliveryRepository {
  constructor(seed = []) {
    this.items = seed.map((item) => ({ ...item }));
  }

  async insert(delivery) {
    const stored = { ...delivery, _id: randomUUID() };
    this.items.unshift(stored);
    return { ...stored };
  }

  async search({ status, text, limit }) {
    const needle = text?.toLowerCase();
    return this.items
      .filter((item) => !status || item.status === status)
      .filter((item) => !needle || ["code", "customer", "destination", "driver"]
        .some((field) => String(item[field] ?? "").toLowerCase().includes(needle)))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit)
      .map((item) => ({ ...item }));
  }

  async update(id, changes) {
    const item = this.items.find((candidate) => candidate._id === id);
    if (!item) return null;
    Object.assign(item, changes);
    return { ...item };
  }

  async remove(id) {
    const before = this.items.length;
    this.items = this.items.filter((item) => item._id !== id);
    return this.items.length < before;
  }
}

module.exports = { InMemoryDeliveryRepository };
