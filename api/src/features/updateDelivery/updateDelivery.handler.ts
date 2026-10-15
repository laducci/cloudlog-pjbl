import { ok } from "../../shared/http/httpResponse";
import { readJsonBody } from "../../shared/http/requestReader";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { UpdateDeliveryUseCase } from "./UpdateDeliveryUseCase";

export function makeUpdateDeliveryHandler({ updateDelivery }: { updateDelivery: UpdateDeliveryUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      const payload = await readJsonBody(request);
      return ok(await updateDelivery.execute(String(request.params.id), payload));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
