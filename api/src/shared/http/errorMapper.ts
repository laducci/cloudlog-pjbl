import { NotFoundError, ValidationError } from "../../domain/errors";
import { json } from "./httpResponse";
import { InvalidRequestError } from "./requestReader";
import type { HttpResponseLike, LoggerLike } from "./types";

type ErrorClass = new (...args: never[]) => Error;

/** Tabela erro -> status HTTP, aberta para extensão (OCP). */
export const errorStatusTable: Array<[ErrorClass, number]> = [
  [InvalidRequestError, 400],
  [ValidationError, 400],
  [NotFoundError, 404],
];

export const SERVER_ERROR_MESSAGE = "Não foi possível concluir a operação no banco de dados.";

export function toHttpError(error: unknown, logger?: LoggerLike): HttpResponseLike {
  const match = errorStatusTable.find(([ErrorType]) => error instanceof ErrorType);
  if (match) return json(match[1], { message: (error as Error).message });
  logger?.error?.(error);
  return json(500, { message: SERVER_ERROR_MESSAGE });
}
