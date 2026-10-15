import { Collection, Document, ObjectId } from "mongodb";
import type { DeliveryChanges, DeliveryRecord } from "../../../domain/delivery/Delivery";
import { InvalidIdentifierError } from "../../../domain/errors";
import type { DeliveryReader, DeliveryRemover, DeliveryUpdater, DeliveryWriter, SearchCriteria } from "../../../domain/ports";

const SEARCHABLE_FIELDS = ["code", "customer", "destination", "driver"];
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface CollectionProvider {
  getCollection(): Promise<Collection>;
}

/** Adaptador de saída sobre o MongoDB Atlas; detalhes do driver ficam confinados aqui (DIP). */
export class MongoDeliveryRepository implements DeliveryWriter, DeliveryReader, DeliveryUpdater, DeliveryRemover {
  constructor(private readonly deps: { connection: CollectionProvider }) {}

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) throw new InvalidIdentifierError();
    return new ObjectId(id);
  }

  async insert(delivery: DeliveryRecord): Promise<DeliveryRecord> {
    const collection = await this.deps.connection.getCollection();
    const { _id: _ignored, ...document } = delivery;
    const result = await collection.insertOne(document as Document);
    return { ...delivery, _id: String(result.insertedId) };
  }

  async search({ status, text, limit }: SearchCriteria): Promise<DeliveryRecord[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (text) filter.$or = SEARCHABLE_FIELDS.map((field) => ({ [field]: { $regex: escapeRegex(text), $options: "i" } }));
    const collection = await this.deps.connection.getCollection();
    return (await collection.find(filter).sort({ updatedAt: -1 }).limit(limit).toArray()) as unknown as DeliveryRecord[];
  }

  async update(id: string, changes: DeliveryChanges): Promise<DeliveryRecord | null> {
    const _id = this.toObjectId(id);
    const collection = await this.deps.connection.getCollection();
    return (await collection.findOneAndUpdate({ _id }, { $set: changes }, { returnDocument: "after" })) as unknown as DeliveryRecord | null;
  }

  async remove(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const collection = await this.deps.connection.getCollection();
    return (await collection.deleteOne({ _id })).deletedCount > 0;
  }
}
