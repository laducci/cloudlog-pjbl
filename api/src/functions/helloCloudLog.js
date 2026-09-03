const { app } = require("@azure/functions");
const { json } = require("../shared/http");

app.http("helloCloudLog", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "hello",
  handler: async (request) => {
    const name = request.query.get("name")?.trim() || "visitante";
    return json(200, {
      message: `Olá, ${name}! A Azure Function do CloudLog está funcionando.`,
      input: { name },
      service: "CloudLog API",
      timestamp: new Date().toISOString(),
    });
  },
});
