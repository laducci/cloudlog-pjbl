import type { DeliveryEventMessage } from "../../domain/alert/DeliveryEventContract";
import type { LoggerLike } from "../../shared/http/types";
import type { ProcessDeliveryEventUseCase } from "./ProcessDeliveryEventUseCase";

/** Adaptador de entrada de mensageria: aceita a mensagem como objeto ou JSON. */
export function parseMessage(message: unknown): DeliveryEventMessage {
  return (typeof message === "string" ? JSON.parse(message) : message) as DeliveryEventMessage;
}

export function makeProcessDeliveryEventHandler({ processDeliveryEvent }: { processDeliveryEvent: ProcessDeliveryEventUseCase }) {
  return async (message: unknown, context?: LoggerLike) => {
    const result = await processDeliveryEvent.execute(parseMessage(message));
    context?.log?.(`[processDeliveryEvent] ${result.type} alerted=${result.alerted}`);
    return result;
  };
}
