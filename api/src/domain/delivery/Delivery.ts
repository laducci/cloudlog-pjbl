import { ValidationError } from "../errors";
import { assertDeliveryStatus, DeliveryStatusValue } from "./DeliveryStatus";

export const TEXT_FIELDS = ["code", "customer", "destination", "driver", "status", "eta"] as const;
type TextField = (typeof TEXT_FIELDS)[number];

export type DeliveryInput = Partial<Record<TextField, unknown>> & { progress?: unknown };

export interface DeliveryRecord {
  _id?: string;
  code: string;
  customer: string;
  destination: string;
  driver: string;
  status: DeliveryStatusValue;
  eta: string;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DeliveryChanges = Partial<Omit<DeliveryRecord, "_id" | "createdAt">> & { updatedAt: Date };

function normalizeProgress(value: unknown): number {
  const progress = Number(value);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new ValidationError("Progresso deve estar entre 0 e 100.");
  }
  return progress;
}

/**
 * Entidade de domínio Entrega (RF-03): concentra validação e normalização (SRP).
 */
export class Delivery {
  private constructor(private readonly data: DeliveryRecord) {}

  static create(input: DeliveryInput, now: Date): Delivery {
    const missing = TEXT_FIELDS.filter((field) => !String(input?.[field] ?? "").trim());
    if (missing.length) throw new ValidationError(`Campos obrigatórios ausentes: ${missing.join(", ")}.`);

    const text = Object.fromEntries(TEXT_FIELDS.map((f) => [f, String(input[f]).trim()])) as Record<TextField, string>;
    const record: DeliveryRecord = {
      ...text,
      status: assertDeliveryStatus(text.status),
      createdAt: now,
      updatedAt: now,
    };
    if (input.progress !== undefined) record.progress = normalizeProgress(input.progress);
    return new Delivery(record);
  }

  static validateChanges(input: DeliveryInput, now: Date): DeliveryChanges {
    const changes: Record<string, unknown> = {};
    for (const field of TEXT_FIELDS) {
      if (input?.[field] !== undefined) changes[field] = String(input[field]).trim();
    }
    if (changes.status !== undefined) assertDeliveryStatus(String(changes.status));
    if (input?.progress !== undefined) changes.progress = normalizeProgress(input.progress);
    if (!Object.keys(changes).length) throw new ValidationError("Informe ao menos um campo para alteração.");
    return { ...(changes as Partial<DeliveryRecord>), updatedAt: now };
  }

  toPrimitives(): DeliveryRecord {
    return { ...this.data };
  }
}
