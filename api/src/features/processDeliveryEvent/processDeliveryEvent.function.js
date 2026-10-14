const { app } = require("@azure/functions");
const { container } = require("../../bootstrap/container");
const { makeProcessDeliveryEventHandler } = require("./processDeliveryEvent.handler");

// Gatilho ServiceBusQueueTrigger. Executa numa Function App dedicada (plano Consumption),
// pois as funções gerenciadas do Static Web Apps aceitam apenas gatilhos HTTP.
app.serviceBusQueue("processDeliveryEvent", {
  connection: "SERVICEBUS_CONNECTION",
  queueName: "%SERVICEBUS_QUEUE%",
  handler: makeProcessDeliveryEventHandler({ processDeliveryEvent: container.processDeliveryEvent }),
});
