const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeCreateDeliveryHandler } = require("./createDelivery.handler");

app.http("createDelivery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: makeCreateDeliveryHandler({ createDelivery: container.createDelivery }),
});
