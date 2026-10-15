import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeCreateDeliveryHandler } from "./createDelivery.handler";

app.http("createDelivery", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: makeCreateDeliveryHandler(container) as never,
});
