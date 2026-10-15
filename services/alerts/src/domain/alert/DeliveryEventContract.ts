/**
 * Contrato do evento publicado pelo Serviço de Entregas, do ponto de vista do consumidor.
 * Microsserviços não compartilham código: cada um mantém sua cópia do contrato (versionado).
 */
export interface DeliveryEventMessage {
  type: "DeliveryCreated" | "DeliveryUpdated" | "DeliveryDeleted" | string;
  version?: number;
  aggregateId: string;
  occurredAt?: string;
  data?: { code?: string; driver?: string; status?: string; destination?: string };
}

export const DELAYED_STATUS = "Atrasada";
export const EVENTS_THAT_CAN_ALERT = new Set(["DeliveryCreated", "DeliveryUpdated"]);
