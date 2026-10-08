const { MongoConnection } = require("../infrastructure/persistence/mongo/MongoConnection");
const { MongoDeliveryRepository } = require("../infrastructure/persistence/mongo/MongoDeliveryRepository");
const { InMemoryDeliveryRepository } = require("../infrastructure/persistence/memory/InMemoryDeliveryRepository");
const { SystemClock } = require("../infrastructure/time/SystemClock");
const { CreateDeliveryUseCase } = require("../features/createDelivery/CreateDeliveryUseCase");
const { SearchDeliveriesUseCase } = require("../features/searchDeliveries/SearchDeliveriesUseCase");
const { UpdateDeliveryUseCase } = require("../features/updateDelivery/UpdateDeliveryUseCase");
const { DeleteDeliveryUseCase } = require("../features/deleteDelivery/DeleteDeliveryUseCase");
const { SayHelloUseCase } = require("../features/hello/SayHelloUseCase");

/**
 * Composition Root: único ponto que conhece as implementações concretas.
 * Os casos de uso recebem abstrações (portas) por injeção de dependência (DIP).
 * DELIVERY_REPOSITORY=memory permite executar a API sem MongoDB.
 */
function buildContainer(env = process.env) {
  const clock = new SystemClock();
  const repository = env.DELIVERY_REPOSITORY === "memory"
    ? new InMemoryDeliveryRepository()
    : new MongoDeliveryRepository({ connection: MongoConnection.fromEnvironment(env) });

  return {
    createDelivery: new CreateDeliveryUseCase({ deliveryWriter: repository, clock }),
    searchDeliveries: new SearchDeliveriesUseCase({ deliveryReader: repository }),
    updateDelivery: new UpdateDeliveryUseCase({ deliveryUpdater: repository, clock }),
    deleteDelivery: new DeleteDeliveryUseCase({ deliveryRemover: repository }),
    sayHello: new SayHelloUseCase({ clock }),
  };
}

const container = buildContainer();

module.exports = { buildContainer, container };
