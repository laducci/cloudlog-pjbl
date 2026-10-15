import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeDeleteDeliveryHandler } from "./deleteDelivery.handler";

app.http("deleteDelivery", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "deliveries/{id}",
  handler: makeDeleteDeliveryHandler(container) as never,
});
