import { TableClient } from "@azure/data-tables";
import type { AlertRecord } from "../../../domain/alert/Alert";
import type { AlertReader, AlertWriter } from "../../../domain/ports";

type TableLike = Pick<TableClient, "createEntity" | "listEntities">;

/**
 * Banco exclusivo do Serviço de Alertas (Database per Service): Azure Table Storage.
 * PartitionKey = dia do alerta; RowKey = tempo invertido + id (ordem decrescente).
 */
export class TableStorageAlertRepository implements AlertWriter, AlertReader {
  constructor(private readonly table: TableLike) {}

  static fromConnectionString(connectionString: string, tableName = "alerts"): TableStorageAlertRepository {
    return new TableStorageAlertRepository(TableClient.fromConnectionString(connectionString, tableName));
  }

  static rowKey(alert: AlertRecord): string {
    const inverted = String(8_640_000_000_000_000 - Date.parse(alert.createdAt)).padStart(16, "0");
    return `${inverted}_${alert.id}`;
  }

  async save(alert: AlertRecord): Promise<void> {
    await this.table.createEntity({ partitionKey: alert.createdAt.slice(0, 10), rowKey: TableStorageAlertRepository.rowKey(alert), ...alert });
  }

  async listRecent(limit: number): Promise<AlertRecord[]> {
    const items: AlertRecord[] = [];
    for await (const entity of this.table.listEntities<AlertRecord>()) {
      const { partitionKey: _p, rowKey: _r, etag: _e, timestamp: _t, ...alert } = entity as unknown as AlertRecord & Record<string, unknown>;
      items.push(alert as AlertRecord);
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
}
