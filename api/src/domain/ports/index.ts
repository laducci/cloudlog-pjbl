import type { DeliveryChanges, DeliveryRecord } from "../delivery/Delivery";
import type { DeliveryEvent } from "../delivery/DeliveryEvents";

/**
 * Portas de saída segregadas (ISP): cada caso de uso depende só do que usa.
 * As implementações ficam em infrastructure/ (DIP).
 */
export interface SearchCriteria {
  status?: string;
  text?: string;
  limit: number;
}

export interface DeliveryWriter {
  insert(delivery: DeliveryRecord): Promise<DeliveryRecord>;
}

export interface DeliveryReader {
  search(criteria: SearchCriteria): Promise<DeliveryRecord[]>;
}

export interface DeliveryUpdater {
  update(id: string, changes: DeliveryChanges): Promise<DeliveryRecord | null>;
}

export interface DeliveryRemover {
  remove(id: string): Promise<boolean>;
}

export interface DeliveryEventPublisher {
  publish(event: DeliveryEvent): Promise<void>;
}

export interface Clock {
  now(): Date;
}
