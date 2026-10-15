import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeGetDashboardHandler } from "./getDashboard.handler";

app.http("webDashboard", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "web/dashboard",
  handler: makeGetDashboardHandler(container) as never,
});
