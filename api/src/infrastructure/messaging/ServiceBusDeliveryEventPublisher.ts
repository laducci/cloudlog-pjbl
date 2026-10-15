import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";
import type { DeliveryEvent } from "../../domain/delivery/DeliveryEvents";
import type { DeliveryEventPublisher } from "../../domain/ports";

type Sender = Pick<ServiceBusSender, "sendMessages">;

/** Publica eventos de domínio numa fila do Azure Service Bus (best effort, ver ADR-13). */
export class ServiceBusDeliveryEventPublisher implements DeliveryEventPublisher {
  sender?: Sender;

  constructor(private readonly config: { connectionString: string; queueName: string; logger?: Pick<Console, "error"> }) {}

  private getSender(): Sender {
    this.sender ??= new ServiceBusClient(this.config.connectionString).createSender(this.config.queueName);
    return this.sender;
  }

  async publish(event: DeliveryEvent): Promise<void> {
    try {
      await this.getSender().sendMessages({
        body: event,
        contentType: "application/json",
        subject: event.type,
        applicationProperties: { eventType: event.type, version: event.version },
      });
    } catch (error) {
      (this.config.logger ?? console).error(`[EventPublisher] falha ao publicar ${event.type}`, error);
    }
  }
}
