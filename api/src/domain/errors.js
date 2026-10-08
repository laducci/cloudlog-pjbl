/**
 * Erros de domínio do CloudLog.
 * Não conhecem HTTP nem banco de dados: a camada de apresentação decide
 * como traduzi-los (ver shared/http/errorMapper.js).
 */
class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends DomainError {}

class InvalidIdentifierError extends ValidationError {
  constructor(message = "Identificador de entrega inválido.") {
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = "Entrega não encontrada.") {
    super(message);
  }
}

module.exports = { DomainError, ValidationError, InvalidIdentifierError, NotFoundError };
