import type { AlertReader, AlertWriter } from "../domain/ports";
import { ListAlertsUseCase } from "../features/listAlerts/ListAlertsUseCase";
import { ProcessDeliveryEventUseCase } from "../features/processDeliveryEvent/ProcessDeliveryEventUseCase";
import { RandomIdGenerator } from "../infrastructure/ids/RandomIdGenerator";
import { LogAlertNotifier } from "../infrastructure/notifications/LogAlertNotifier";
import { InMemoryAlertRepository } from "../infrastructure/persistence/memory/InMemoryAlertRepository";
import { TableStorageAlertRepository } from "../infrastructure/persistence/table/TableStorageAlertRepository";
import { SystemClock } from "../infrastructure/time/SystemClock";

/** Composition Root do Serviço de Alertas. ALERTS_TABLE_CONNECTION liga o Table Storage. */
export function buildContainer(env: NodeJS.ProcessEnv = process.env) {
  const repository: AlertWriter & AlertReader = env.ALERTS_TABLE_CONNECTION
    ? TableStorageAlertRepository.fromConnectionString(env.ALERTS_TABLE_CONNECTION, env.ALERTS_TABLE_NAME || "alerts")
    : new InMemoryAlertRepository();
  const alertNotifier = new LogAlertNotifier();

  return {
    repository,
    alertNotifier,
    processDeliveryEvent: new ProcessDeliveryEventUseCase({ alertWriter: repository, alertNotifier, clock: new SystemClock(), ids: new RandomIdGenerator() }),
    listAlerts: new ListAlertsUseCase({ alertReader: repository }),
  };
}

export const container = buildContainer();
