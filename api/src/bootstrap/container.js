const { MongoConnection } = require("../infrastructure/persistence/mongo/MongoConnection");
const { MongoDeliveryRepository } = require("../infrastructure/persistence/mongo/MongoDeliveryRepository");
const { InMemoryDeliveryRepository } = require("../infrastructure/persistence/memory/InMemoryDeliveryRepository");
const { ServiceBusDeliveryEventPublisher } = require("../infrastructure/messaging/ServiceBusDeliveryEventPublisher");
const { LoggingEventPublisher } = require("../infrastructure/messaging/LoggingEventPublisher");
const { InMemoryEventPublisher } = require("../infrastructure/messaging/InMemoryEventPublisher");
const { LogAlertNotifier } = require("../infrastructure/notifications/LogAlertNotifier");
const { SystemClock } = require("../infrastructure/time/SystemClock");
const { CreateDeliveryUseCase } = require("../features/createDelivery/CreateDeliveryUseCase");
const { SearchDeliveriesUseCase } = require("../features/searchDeliveries/SearchDeliveriesUseCase");
const { UpdateDeliveryUseCase } = require("../features/updateDelivery/UpdateDeliveryUseCase");
const { DeleteDeliveryUseCase } = require("../features/deleteDelivery/DeleteDeliveryUseCase");
const { ProcessDeliveryEventUseCase } = require("../features/processDeliveryEvent/ProcessDeliveryEventUseCase");
const { SayHelloUseCase } = require("../features/hello/SayHelloUseCase");

const DEFAULT_QUEUE = "cloudlog-delivery-events";

function buildRepository(env) {
  if (env.DELIVERY_REPOSITORY === "memory") return new InMemoryDeliveryRepository();
  return new MongoDeliveryRepository({ connection: MongoConnection.fromEnvironment(env) });
}

function buildEventPublisher(env) {
  if (env.EVENT_PUBLISHER === "memory") return new InMemoryEventPublisher();
  if (env.SERVICEBUS_CONNECTION) {
    return new ServiceBusDeliveryEventPublisher({
      connectionString: env.SERVICEBUS_CONNECTION,
      queueName: env.SERVICEBUS_QUEUE || DEFAULT_QUEUE,
    });
  }
  return new LoggingEventPublisher();
}

/**
 * Composition Root: único ponto que conhece as implementações concretas.
 * Os casos de uso recebem abstrações (portas) por injeção de dependência (DIP).
 *  - DELIVERY_REPOSITORY=memory  -> executa sem MongoDB
 *  - SERVICEBUS_CONNECTION       -> publica eventos no Azure Service Bus (EDA)
 *  - EVENT_PUBLISHER=memory      -> guarda eventos em memória (testes)
 */
function buildContainer(env = process.env) {
  const clock = new SystemClock();
  const repository = buildRepository(env);
  const eventPublisher = buildEventPublisher(env);
  const alertNotifier = new LogAlertNotifier();

  return {
    eventPublisher,
    alertNotifier,
    createDelivery: new CreateDeliveryUseCase({ deliveryWriter: repository, eventPublisher, clock }),
    searchDeliveries: new SearchDeliveriesUseCase({ deliveryReader: repository }),
    updateDelivery: new UpdateDeliveryUseCase({ deliveryUpdater: repository, eventPublisher, clock }),
    deleteDelivery: new DeleteDeliveryUseCase({ deliveryRemover: repository, eventPublisher, clock }),
    processDeliveryEvent: new ProcessDeliveryEventUseCase({ alertNotifier }),
    sayHello: new SayHelloUseCase({ clock }),
  };
}

const container = buildContainer();

module.exports = { buildContainer, container, DEFAULT_QUEUE };
