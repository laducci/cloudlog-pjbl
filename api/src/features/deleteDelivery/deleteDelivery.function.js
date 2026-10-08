const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeDeleteDeliveryHandler } = require("./deleteDelivery.handler");

app.http("deleteDelivery", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: makeDeleteDeliveryHandler({ deleteDelivery: container.deleteDelivery }),
});
