import { ok } from "../../shared/http/httpResponse";
import { readQuery } from "../../shared/http/requestReader";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { SearchDeliveriesUseCase } from "./SearchDeliveriesUseCase";

export function makeSearchDeliveriesHandler({ searchDeliveries }: { searchDeliveries: SearchDeliveriesUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      return ok(await searchDeliveries.execute({ status: readQuery(request, "status"), search: readQuery(request, "search") }));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
