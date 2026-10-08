const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeSearchDeliveriesHandler } = require("./searchDeliveries.handler");

app.http("searchDeliveries", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: makeSearchDeliveriesHandler({ searchDeliveries: container.searchDeliveries }),
});
