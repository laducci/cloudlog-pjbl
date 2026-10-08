const { ok } = require("../../shared/http/httpResponse");
const { readJsonBody } = require("../../shared/http/requestReader");
const { toHttpError } = require("../../shared/http/errorMapper");

function makeUpdateDeliveryHandler({ updateDelivery }) {
  return async function updateDeliveryHandler(request, context) {
    try {
      const payload = await readJsonBody(request);
      const delivery = await updateDelivery.execute(request.params.id, payload);
      return ok(delivery);
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}

module.exports = { makeUpdateDeliveryHandler };
