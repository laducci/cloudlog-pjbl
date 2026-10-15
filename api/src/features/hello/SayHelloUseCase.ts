import type { Clock } from "../../domain/ports";

/** Endpoint introdutório (Entrega 1): health check com saudação. */
export class SayHelloUseCase {
  constructor(private readonly deps: { clock: Clock }) {}

  execute({ name }: { name?: string } = {}) {
    const visitor = name || "visitante";
    return {
      message: `Olá, ${visitor}! A Azure Function do CloudLog está funcionando.`,
      input: { name: visitor },
      service: "CloudLog API",
      timestamp: this.deps.clock.now().toISOString(),
    };
  }
}
