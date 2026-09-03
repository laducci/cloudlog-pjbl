const { app } = require("@azure/functions");
const { getCollection } = require("../shared/mongo");
const { json, normalizeDelivery, serverError, validateDelivery } = require("../shared/http");

app.http("createDelivery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: async (request, context) => {
    try {
      const payload = await request.json();
      const validationError = validateDelivery(payload);
      if (validationError) return json(400, { message: validationError });
      const delivery = {
        ...normalizeDelivery(payload),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const collection = await getCollection();
      const result = await collection.insertOne(delivery);
      return json(201, { ...delivery, _id: result.insertedId });
    } catch (error) {
      if (error instanceof SyntaxError) return json(400, { message: "O corpo da requisição deve ser um JSON válido." });
      return serverError(context, error);
    }
  },
});
