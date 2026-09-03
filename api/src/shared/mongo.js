const { MongoClient } = require("mongodb");

let client;
let connection;

async function getCollection() {
  const uri = process.env.MONGODB_ATLAS_URI;
  if (!uri) throw new Error("A configuração MONGODB_ATLAS_URI não foi definida.");

  if (!client) {
    client = new MongoClient(uri, { maxIdleTimeMS: 60000 });
  }
  if (!connection) {
    connection = client.connect().catch((error) => {
      connection = undefined;
      throw error;
    });
  }

  await connection;
  const database = process.env.MONGODB_ATLAS_DATABASE || "cloudlog";
  const collection = process.env.MONGODB_ATLAS_COLLECTION || "deliveries";
  return client.db(database).collection(collection);
}

module.exports = { getCollection };
