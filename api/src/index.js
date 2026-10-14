// Ponto de entrada das Azure Functions (modelo de programação v4).
// Cada fatia vertical registra sua própria função.
require("./features/hello/hello.function");
require("./features/searchDeliveries/searchDeliveries.function");
require("./features/createDelivery/createDelivery.function");
require("./features/updateDelivery/updateDelivery.function");
require("./features/deleteDelivery/deleteDelivery.function");

// Consumidor de eventos (ServiceBusQueueTrigger): habilitado apenas na Function App
// dedicada, porque o Static Web Apps aceita somente gatilhos HTTP.
if (process.env.SERVICEBUS_CONSUMER_ENABLED === "true") {
  require("./features/processDeliveryEvent/processDeliveryEvent.function");
}
