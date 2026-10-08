const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeHelloHandler } = require("./hello.handler");

app.http("helloCloudLog", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "hello",
  handler: makeHelloHandler({ sayHello: container.sayHello }),
});
