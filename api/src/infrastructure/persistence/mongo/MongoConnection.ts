import { Collection, MongoClient } from "mongodb";

/** Conexão reaproveitada entre execuções da Function (plano Consumption). */
export class MongoConnection {
  private client?: MongoClient;
  private connecting?: Promise<MongoClient>;

  constructor(private readonly config: { uri?: string; database: string; collection: string }) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): MongoConnection {
    return new MongoConnection({
      uri: env.MONGODB_ATLAS_URI,
      database: env.MONGODB_ATLAS_DATABASE || "cloudlog",
      collection: env.MONGODB_ATLAS_COLLECTION || "deliveries",
    });
  }

  async getCollection(): Promise<Collection> {
    if (!this.config.uri) throw new Error("A configuração MONGODB_ATLAS_URI não foi definida.");
    this.client ??= new MongoClient(this.config.uri, { maxIdleTimeMS: 60000 });
    this.connecting ??= this.client.connect().catch((error) => {
      this.connecting = undefined;
      throw error;
    });
    await this.connecting;
    return this.client.db(this.config.database).collection(this.config.collection);
  }
}
