import type { AlertRecord } from "../../../domain/alert/Alert";
import type { AlertReader, AlertWriter } from "../../../domain/ports";

export class InMemoryAlertRepository implements AlertWriter, AlertReader {
  readonly items: AlertRecord[] = [];

  async save(alert: AlertRecord): Promise<void> {
    this.items.unshift({ ...alert });
  }

  async listRecent(limit: number): Promise<AlertRecord[]> {
    return this.items.slice(0, limit).map((a) => ({ ...a }));
  }
}
