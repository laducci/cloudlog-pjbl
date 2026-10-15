export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Um microsserviço de que o BFF depende não respondeu. */
export class UpstreamUnavailableError extends DomainError {
  constructor(service: string) {
    super(`Serviço ${service} indisponível no momento.`);
  }
}
