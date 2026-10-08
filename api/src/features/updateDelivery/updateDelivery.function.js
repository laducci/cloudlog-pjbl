const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeUpdateDeliveryHandler } = require("./updateDelivery.handler");

app.http("updateDelivery", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: makeUpdateDeliveryHandler({ updateDelivery: container.updateDelivery }),
});
