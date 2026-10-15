import { TableStorageAlertRepository } from "../../src/infrastructure/persistence/table/TableStorageAlertRepository";
import { Alert } from "../../src/domain/alert/Alert";
import { delayedEvent, FIXED_NOW } from "../support/fakes";

describe("Adaptador Azure Table Storage (banco exclusivo do serviço)", () => {
  it("grava com PartitionKey por dia e devolve os mais recentes primeiro", async () => {
    const rows: Record<string, unknown>[] = [];
    const table = {
      createEntity: async (e: Record<string, unknown>) => { rows.push(e); return {}; },
      listEntities: () => (async function* () { for (const r of rows) yield r; })(),
    };
    const repo = new TableStorageAlertRepository(table as never);
    const older = Alert.fromDelayedDelivery(delayedEvent(), "a1", new Date("2026-10-14T10:00:00Z")).toPrimitives();
    const newer = Alert.fromDelayedDelivery(delayedEvent(), "a2", FIXED_NOW).toPrimitives();
    await repo.save(older);
    await repo.save(newer);
    expect(rows[1].partitionKey).toBe("2026-10-15");
    expect((await repo.listRecent(10)).map((a) => a.id)).toEqual(["a2", "a1"]);
    expect(TableStorageAlertRepository.rowKey(newer) < TableStorageAlertRepository.rowKey(older)).toBe(true);
  });
});
