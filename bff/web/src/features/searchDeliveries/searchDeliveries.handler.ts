import { ok } from "../../shared/http/httpResponse";
import { readQuery } from "../../shared/http/requestReader";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { SearchWebDeliveriesUseCase } from "./SearchWebDeliveriesUseCase";

export function makeSearchDeliveriesHandler({ searchWebDeliveries }: { searchWebDeliveries: SearchWebDeliveriesUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      return ok(await searchWebDeliveries.execute({ status: readQuery(request, "status"), search: readQuery(request, "search") }));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
