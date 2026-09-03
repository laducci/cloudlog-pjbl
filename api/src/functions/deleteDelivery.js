const { app } = require("@azure/functions");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../shared/mongo");
const { json, serverError } = require("../shared/http");

app.http("deleteDelivery", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!ObjectId.isValid(id)) return json(400, { message: "Identificador de entrega inválido." });
      const collection = await getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return json(404, { message: "Entrega não encontrada." });
      return json(200, { deleted: true, id });
    } catch (error) {
      return serverError(context, error);
    }
  },
});
