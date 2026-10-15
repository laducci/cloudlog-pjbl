import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeSearchDeliveriesHandler } from "./searchDeliveries.handler";

app.http("searchDeliveries", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "deliveries",
  handler: makeSearchDeliveriesHandler(container) as never,
});
