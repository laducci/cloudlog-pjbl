import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeListAlertsHandler } from "./listAlerts.handler";

app.http("listAlerts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "alerts",
  handler: makeListAlertsHandler(container) as never,
});
