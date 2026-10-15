import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeUpdateDeliveryHandler } from "./updateDelivery.handler";

app.http("updateDelivery", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: makeUpdateDeliveryHandler(container) as never,
});
