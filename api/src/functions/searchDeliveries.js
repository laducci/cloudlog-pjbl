const { app } = require("@azure/functions");
const { getCollection } = require("../shared/mongo");
const { json, serverError } = require("../shared/http");

app.http("searchDeliveries", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: async (request, context) => {
    try {
      const status = request.query.get("status")?.trim();
      const search = request.query.get("search")?.trim();
      const filter = {};
      if (status && status !== "Todos") filter.status = status;
      if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = ["code", "customer", "destination", "driver"].map((field) => ({
          [field]: { $regex: safe, $options: "i" },
        }));
      }
      const collection = await getCollection();
      const items = await collection.find(filter).sort({ updatedAt: -1 }).limit(100).toArray();
      return json(200, { items, total: items.length });
    } catch (error) {
      return serverError(context, error);
    }
  },
});
