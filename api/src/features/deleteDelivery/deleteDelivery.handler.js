const { ok } = require("../../shared/http/httpResponse");
const { toHttpError } = require("../../shared/http/errorMapper");

function makeDeleteDeliveryHandler({ deleteDelivery }) {
  return async function deleteDeliveryHandler(request, context) {
    try {
      const result = await deleteDelivery.execute(request.params.id);
      return ok(result);
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}

module.exports = { makeDeleteDeliveryHandler };
