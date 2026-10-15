import { ok } from "../../shared/http/httpResponse";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { DeleteDeliveryUseCase } from "./DeleteDeliveryUseCase";

export function makeDeleteDeliveryHandler({ deleteDelivery }: { deleteDelivery: DeleteDeliveryUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      return ok(await deleteDelivery.execute(String(request.params.id)));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
