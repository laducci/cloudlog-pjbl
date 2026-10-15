import { randomUUID } from "node:crypto";
import type { DeliveryChanges, DeliveryRecord } from "../../../domain/delivery/Delivery";
import type { DeliveryReader, DeliveryRemover, DeliveryUpdater, DeliveryWriter, SearchCriteria } from "../../../domain/ports";

/** Mesmas portas em memória: testes e execução local (LSP). */
export class InMemoryDeliveryRepository implements DeliveryWriter, DeliveryReader, DeliveryUpdater, DeliveryRemover {
  items: DeliveryRecord[] = [];

  async insert(delivery: DeliveryRecord): Promise<DeliveryRecord> {
    const stored = { ...delivery, _id: randomUUID() };
    this.items.unshift(stored);
    return { ...stored };
  }

  async search({ status, text, limit }: SearchCriteria): Promise<DeliveryRecord[]> {
    const needle = text?.toLowerCase();
    return this.items
      .filter((item) => !status || item.status === status)
      .filter((item) => !needle || [item.code, item.customer, item.destination, item.driver].some((v) => v.toLowerCase().includes(needle)))
      .slice(0, limit)
      .map((item) => ({ ...item }));
  }

  async update(id: string, changes: DeliveryChanges): Promise<DeliveryRecord | null> {
    const item = this.items.find((candidate) => candidate._id === id);
    if (!item) return null;
    Object.assign(item, changes);
    return { ...item };
  }

  async remove(id: string): Promise<boolean> {
    const before = this.items.length;
    this.items = this.items.filter((item) => item._id !== id);
    return this.items.length < before;
  }
}
