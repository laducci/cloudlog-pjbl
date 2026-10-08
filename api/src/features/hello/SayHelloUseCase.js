const { assertPort } = require("../../domain/ports/deliveryPorts");

/** Caso de uso do endpoint introdutório (Entrega 1): health check com saudação. */
class SayHelloUseCase {
  constructor({ clock }) {
    this.clock = assertPort("Clock", clock);
  }

  execute({ name } = {}) {
    const visitor = name || "visitante";
    return {
      message: `Olá, ${visitor}! A Azure Function do CloudLog está funcionando.`,
      input: { name: visitor },
      service: "CloudLog API",
      timestamp: this.clock.now().toISOString(),
    };
  }
}

module.exports = { SayHelloUseCase };
