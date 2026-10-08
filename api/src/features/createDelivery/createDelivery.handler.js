const { created } = require("../../shared/http/httpResponse");
const { readJsonBody } = require("../../shared/http/requestReader");
const { toHttpError } = require("../../shared/http/errorMapper");

/** Adaptador de entrada HTTP: traduz a requisição para o caso de uso. */
function makeCreateDeliveryHandler({ createDelivery }) {
  return async function createDeliveryHandler(request, context) {
    try {
      const payload = await readJsonBody(request);
      const delivery = await createDelivery.execute(payload);
      return created(delivery);
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}

module.exports = { makeCreateDeliveryHandler };
