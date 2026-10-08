const { MongoClient } = require("mongodb");

/**
 * Conexão reaproveitada entre execuções da Function (evita abrir um
 * cliente por requisição no plano Consumption).
 */
class MongoConnection {
  constructor({ uri, database, collection }) {
    this.uri = uri;
    this.databaseName = database;
    this.collectionName = collection;
    this.client = undefined;
    this.connecting = undefined;
  }

  static fromEnvironment(env = process.env) {
    return new MongoConnection({
      uri: env.MONGODB_ATLAS_URI,
      database: env.MONGODB_ATLAS_DATABASE || "cloudlog",
      collection: env.MONGODB_ATLAS_COLLECTION || "deliveries",
    });
  }

  async getCollection() {
    if (!this.uri) throw new Error("A configuração MONGODB_ATLAS_URI não foi definida.");
    if (!this.client) this.client = new MongoClient(this.uri, { maxIdleTimeMS: 60000 });
    if (!this.connecting) {
      this.connecting = this.client.connect().catch((error) => {
        this.connecting = undefined;
        throw error;
      });
    }
    await this.connecting;
    return this.client.db(this.databaseName).collection(this.collectionName);
  }
}

module.exports = { MongoConnection };
