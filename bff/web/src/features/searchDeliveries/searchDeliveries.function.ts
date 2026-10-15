import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeSearchDeliveriesHandler } from "./searchDeliveries.handler";

app.http("webDeliveries", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "web/deliveries",
  handler: makeSearchDeliveriesHandler(container) as never,
});
