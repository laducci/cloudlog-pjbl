const { ValidationError, NotFoundError } = require("../../domain/errors");
const { InvalidRequestError } = require("./requestReader");
const { json } = require("./httpResponse");

/**
 * Tabela de tradução erro -> status HTTP.
 * Aberta para extensão (OCP): um novo tipo de erro entra como nova linha,
 * sem alterar os handlers das funcionalidades.
 */
const errorStatusTable = [
  [InvalidRequestError, 400],
  [ValidationError, 400],
  [NotFoundError, 404],
];

const SERVER_ERROR_MESSAGE = "Não foi possível concluir a operação no banco de dados.";

function toHttpError(error, context) {
  const match = errorStatusTable.find(([ErrorType]) => error instanceof ErrorType);
  if (match) return json(match[1], { message: error.message });
  context?.error?.(error);
  return json(500, { message: SERVER_ERROR_MESSAGE });
}

module.exports = { toHttpError, errorStatusTable, SERVER_ERROR_MESSAGE };
