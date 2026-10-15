import type { DeliveryEventPublisher } from "../domain/ports";
import { CreateDeliveryUseCase } from "../features/createDelivery/CreateDeliveryUseCase";
import { DeleteDeliveryUseCase } from "../features/deleteDelivery/DeleteDeliveryUseCase";
import { SayHelloUseCase } from "../features/hello/SayHelloUseCase";
import { SearchDeliveriesUseCase } from "../features/searchDeliveries/SearchDeliveriesUseCase";
import { UpdateDeliveryUseCase } from "../features/updateDelivery/UpdateDeliveryUseCase";
import { InMemoryEventPublisher } from "../infrastructure/messaging/InMemoryEventPublisher";
import { LoggingEventPublisher } from "../infrastructure/messaging/LoggingEventPublisher";
import { ServiceBusDeliveryEventPublisher } from "../infrastructure/messaging/ServiceBusDeliveryEventPublisher";
import { InMemoryDeliveryRepository } from "../infrastructure/persistence/memory/InMemoryDeliveryRepository";
import { MongoConnection } from "../infrastructure/persistence/mongo/MongoConnection";
import { MongoDeliveryRepository } from "../infrastructure/persistence/mongo/MongoDeliveryRepository";
import { SystemClock } from "../infrastructure/time/SystemClock";

export const DEFAULT_QUEUE = "cloudlog-delivery-events";

function buildEventPublisher(env: NodeJS.ProcessEnv): DeliveryEventPublisher {
  if (env.EVENT_PUBLISHER === "memory") return new InMemoryEventPublisher();
  if (env.SERVICEBUS_CONNECTION) {
    return new ServiceBusDeliveryEventPublisher({ connectionString: env.SERVICEBUS_CONNECTION, queueName: env.SERVICEBUS_QUEUE || DEFAULT_QUEUE });
  }
  return new LoggingEventPublisher();
}

/** Composition Root: único ponto que conhece as implementações concretas (DIP). */
export function buildContainer(env: NodeJS.ProcessEnv = process.env) {
  const clock = new SystemClock();
  const repository = env.DELIVERY_REPOSITORY === "memory"
    ? new InMemoryDeliveryRepository()
    : new MongoDeliveryRepository({ connection: MongoConnection.fromEnvironment(env) });
  const eventPublisher = buildEventPublisher(env);

  return {
    eventPublisher,
    createDelivery: new CreateDeliveryUseCase({ deliveryWriter: repository, eventPublisher, clock }),
    searchDeliveries: new SearchDeliveriesUseCase({ deliveryReader: repository }),
    updateDelivery: new UpdateDeliveryUseCase({ deliveryUpdater: repository, eventPublisher, clock }),
    deleteDelivery: new DeleteDeliveryUseCase({ deliveryRemover: repository, eventPublisher, clock }),
    sayHello: new SayHelloUseCase({ clock }),
  };
}

export const container = buildContainer();
