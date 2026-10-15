/** Erros de domínio: não conhecem HTTP nem banco (a tradução fica em shared/http). */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {}

export class InvalidIdentifierError extends ValidationError {
  constructor(message = "Identificador de entrega inválido.") {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Entrega não encontrada.") {
    super(message);
  }
}
