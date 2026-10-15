import { ValidationError } from "../../domain/errors";
import { json } from "./httpResponse";
import { InvalidRequestError } from "./requestReader";
import type { HttpResponseLike, LoggerLike } from "./types";

type ErrorClass = new (...args: never[]) => Error;

export const errorStatusTable: Array<[ErrorClass, number]> = [
  [InvalidRequestError, 400],
  [ValidationError, 400],
];

export function toHttpError(error: unknown, logger?: LoggerLike): HttpResponseLike {
  const match = errorStatusTable.find(([ErrorType]) => error instanceof ErrorType);
  if (match) return json(match[1], { message: (error as Error).message });
  logger?.error?.(error);
  return json(500, { message: "Não foi possível consultar os alertas." });
}
