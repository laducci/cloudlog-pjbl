import { ValidationError } from "../errors";

/** Value Object: status permitidos para uma entrega. */
export const DeliveryStatus = {
  PENDING: "Pendente",
  IN_ROUTE: "Em rota",
  DELAYED: "Atrasada",
  DELIVERED: "Entregue",
} as const;

export type DeliveryStatusValue = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const deliveryStatusValues = (): DeliveryStatusValue[] => Object.values(DeliveryStatus);

export function assertDeliveryStatus(value: string): DeliveryStatusValue {
  if (!deliveryStatusValues().includes(value as DeliveryStatusValue)) throw new ValidationError("Status inválido.");
  return value as DeliveryStatusValue;
}
