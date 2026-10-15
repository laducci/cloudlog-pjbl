import { ok } from "../../shared/http/httpResponse";
import { readQuery } from "../../shared/http/requestReader";
import { toHttpError } from "../../shared/http/errorMapper";
import type { HttpRequestLike, LoggerLike } from "../../shared/http/types";
import type { ListAlertsUseCase } from "./ListAlertsUseCase";

export function makeListAlertsHandler({ listAlerts }: { listAlerts: ListAlertsUseCase }) {
  return async (request: HttpRequestLike, context?: LoggerLike) => {
    try {
      return ok(await listAlerts.execute({ limit: Number(readQuery(request, "limit")) || undefined }));
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
