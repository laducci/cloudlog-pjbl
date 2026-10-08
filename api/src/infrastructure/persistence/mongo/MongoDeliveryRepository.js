const { ObjectId } = require("mongodb");
const { InvalidIdentifierError } = require("../../../domain/errors");

const SEARCHABLE_FIELDS = ["code", "customer", "destination", "driver"];
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Adaptador de saída: implementa as portas DeliveryWriter, DeliveryReader,
 * DeliveryUpdater e DeliveryRemover sobre o MongoDB Atlas.
 * Detalhes do Mongo (ObjectId, $regex, $set) ficam confinados aqui (DIP).
 */
class MongoDeliveryRepository {
  constructor({ connection }) {
    this.connection = connection;
  }

  toObjectId(id) {
    if (!ObjectId.isValid(id)) throw new InvalidIdentifierError();
    return new ObjectId(id);
  }

  async insert(delivery) {
    const collection = await this.connection.getCollection();
    const document = { ...delivery };
    const result = await collection.insertOne(document);
    return { ...delivery, _id: result.insertedId };
  }

  async search({ status, text, limit }) {
    const filter = {};
    if (status) filter.status = status;
    if (text) {
      const safe = escapeRegex(text);
      filter.$or = SEARCHABLE_FIELDS.map((field) => ({ [field]: { $regex: safe, $options: "i" } }));
    }
    const collection = await this.connection.getCollection();
    return collection.find(filter).sort({ updatedAt: -1 }).limit(limit).toArray();
  }

  async update(id, changes) {
    const _id = this.toObjectId(id);
    const collection = await this.connection.getCollection();
    return collection.findOneAndUpdate({ _id }, { $set: changes }, { returnDocument: "after" });
  }

  async remove(id) {
    const _id = this.toObjectId(id);
    const collection = await this.connection.getCollection();
    const result = await collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }
}

module.exports = { MongoDeliveryRepository };
