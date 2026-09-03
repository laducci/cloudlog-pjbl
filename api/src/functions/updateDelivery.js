const { app } = require("@azure/functions");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../shared/mongo");
const { json, normalizeDelivery, serverError, validateDelivery } = require("../shared/http");

app.http("updateDelivery", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!ObjectId.isValid(id)) return json(400, { message: "Identificador de entrega inválido." });
      const payload = await request.json();
      const validationError = validateDelivery(payload, true);
      if (validationError) return json(400, { message: validationError });
      const changes = normalizeDelivery(payload);
      if (!Object.keys(changes).length) return json(400, { message: "Informe ao menos um campo para alteração." });
      changes.updatedAt = new Date();
      const collection = await getCollection();
      const item = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: changes },
        { returnDocument: "after" },
      );
      if (!item) return json(404, { message: "Entrega não encontrada." });
      return json(200, item);
    } catch (error) {
      if (error instanceof SyntaxError) return json(400, { message: "O corpo da requisição deve ser um JSON válido." });
      return serverError(context, error);
    }
  },
});
