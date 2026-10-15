import type { AlertRecord } from "../alert/Alert";

/** Portas de saída do Serviço de Alertas (ISP + DIP). */
export interface AlertWriter {
  save(alert: AlertRecord): Promise<void>;
}

export interface AlertReader {
  listRecent(limit: number): Promise<AlertRecord[]>;
}

export interface AlertNotifier {
  notify(alert: AlertRecord): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}
