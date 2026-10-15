import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeHelloHandler } from "./hello.handler";

app.http("helloCloudLog", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "hello",
  handler: makeHelloHandler(container) as never,
});
