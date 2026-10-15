import { ok } from "../../shared/http/httpResponse";
import { toHttpError } from "../../shared/http/errorMapper";
import type { LoggerLike } from "../../shared/http/types";
import type { GetDashboardUseCase } from "./GetDashboardUseCase";

export function makeGetDashboardHandler({ getDashboard }: { getDashboard: GetDashboardUseCase }) {
  return async (_request: unknown, context?: LoggerLike) => {
    try {
      return ok(await getDashboard.execute());
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}
