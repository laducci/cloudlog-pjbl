import { Alert, AlertRecord } from "../../domain/alert/Alert";
import type { DeliveryEventMessage } from "../../domain/alert/DeliveryEventContract";
import { ValidationError } from "../../domain/errors";
import type { AlertNotifier, AlertWriter, Clock, IdGenerator } from "../../domain/ports";

export interface ProcessResult {
  alerted: boolean;
  type: string;
  alert?: AlertRecord;
}

/** Caso de uso consumidor (EDA): evento de entrega atrasada vira alerta salvo e notificado. */
export class ProcessDeliveryEventUseCase {
  constructor(private readonly deps: { alertWriter: AlertWriter; alertNotifier: AlertNotifier; clock: Clock; ids: IdGenerator }) {}

  async execute(event: DeliveryEventMessage): Promise<ProcessResult> {
    if (!event?.type || !event?.aggregateId) throw new ValidationError("Evento de entrega inválido.");
    if (!Alert.shouldRaiseFor(event)) return { alerted: false, type: event.type };
    const alert = Alert.fromDelayedDelivery(event, this.deps.ids.next(), this.deps.clock.now()).toPrimitives();
    await this.deps.alertWriter.save(alert);
    await this.deps.alertNotifier.notify(alert);
    return { alerted: true, type: event.type, alert };
  }
}
