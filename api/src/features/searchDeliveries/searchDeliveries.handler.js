const { ok } = require("../../shared/http/httpResponse");
const { readQuery } = require("../../shared/http/requestReader");
const { toHttpError } = require("../../shared/http/errorMapper");

function makeSearchDeliveriesHandler({ searchDeliveries }) {
  return async function searchDeliveriesHandler(request, context) {
    try {
      const result = await searchDeliveries.execute({
        status: readQuery(request, "status"),
        search: readQuery(request, "search"),
      });
      return ok(result);
    } catch (error) {
      return toHttpError(error, context);
    }
  };
}

module.exports = { makeSearchDeliveriesHandler };
