import { created } from "../../shared/http/httpResponse";
import { readJsonBody } from "../../shared/http/requestReader";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { CreateDeliveryUseCase } from "./CreateDeliveryUseCase";

export function makeCreateDeliveryHandler({ createDelivery }: { createDelivery: CreateDeliveryUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      return created(await createDelivery.execute(await readJsonBody(request)));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
