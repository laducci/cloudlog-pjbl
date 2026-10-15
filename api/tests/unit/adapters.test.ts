import { InvalidIdentifierError } from "../../src/domain/errors";
import { ServiceBusDeliveryEventPublisher } from "../../src/infrastructure/messaging/ServiceBusDeliveryEventPublisher";
import { MongoDeliveryRepository } from "../../src/infrastructure/persistence/mongo/MongoDeliveryRepository";
import type { DeliveryEvent } from "../../src/domain/delivery/DeliveryEvents";

describe("Adaptadores de infraestrutura", () => {
  it("Mongo: id inválido vira erro de domínio sem tocar no banco", async () => {
    const repo = new MongoDeliveryRepository({ connection: { getCollection: () => { throw new Error("não deveria conectar"); } } as never });
    await expect(repo.update("123", { updatedAt: new Date() })).rejects.toBeInstanceOf(InvalidIdentifierError);
    await expect(repo.remove("abc")).rejects.toBeInstanceOf(InvalidIdentifierError);
  });

  it("Mongo: busca usa regex escapada e limite", async () => {
    const captured: { filter?: Record<string, any>; limit?: number } = {};
    const cursor = { sort: () => cursor, limit: (n: number) => { captured.limit = n; return cursor; }, toArray: async () => [] };
    const collection = { find: (filter: Record<string, any>) => { captured.filter = filter; return cursor; } };
    const repo = new MongoDeliveryRepository({ connection: { getCollection: async () => collection } as never });
    await repo.search({ status: "Em rota", text: "CL.20", limit: 100 });
    expect(captured.filter?.status).toBe("Em rota");
    expect(captured.filter?.$or[0].code.$regex).toBe("CL\\.20");
    expect(captured.limit).toBe(100);
  });

  it("Service Bus: envia subject/propriedades e não derruba a operação em falha", async () => {
    const sent: any[] = [];
    const publisher = new ServiceBusDeliveryEventPublisher({ connectionString: "x", queueName: "q", logger: { error: () => {} } });
    publisher.sender = { sendMessages: async (m: any) => { sent.push(m); } } as never;
    const event = { type: "DeliveryCreated", version: 1, aggregateId: "1", data: {} } as unknown as DeliveryEvent;
    await publisher.publish(event);
    expect(sent[0].subject).toBe("DeliveryCreated");
    publisher.sender = { sendMessages: async () => { throw new Error("rede"); } } as never;
    await expect(publisher.publish(event)).resolves.toBeUndefined();
  });
});
