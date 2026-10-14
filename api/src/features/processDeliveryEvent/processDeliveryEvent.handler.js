/** Adaptador de entrada de mensageria: traduz a mensagem da fila para o caso de uso. */
function parseMessage(message) {
  if (typeof message === "string") return JSON.parse(message);
  return message;
}

function makeProcessDeliveryEventHandler({ processDeliveryEvent }) {
  return async function processDeliveryEventHandler(message, context) {
    const event = parseMessage(message);
    const result = await processDeliveryEvent.execute(event);
    context?.log?.(`[processDeliveryEvent] ${result.type} alerted=${result.alerted}`);
    return result;
  };
}

module.exports = { makeProcessDeliveryEventHandler, parseMessage };
