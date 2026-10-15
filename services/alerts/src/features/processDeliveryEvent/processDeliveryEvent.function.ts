import { app } from "@azure/functions";
import { container } from "../../bootstrap/container";
import { makeProcessDeliveryEventHandler } from "./processDeliveryEvent.handler";

// Gatilho ServiceBusQueueTrigger (Function App dedicada, plano Consumption).
app.serviceBusQueue("processDeliveryEvent", {
  connection: "SERVICEBUS_CONNECTION",
  queueName: "%SERVICEBUS_QUEUE%",
  handler: makeProcessDeliveryEventHandler(container) as never,
});
