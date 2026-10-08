const { ok } = require("../../shared/http/httpResponse");
const { readQuery } = require("../../shared/http/requestReader");

function makeHelloHandler({ sayHello }) {
  return async function helloHandler(request) {
    return ok(sayHello.execute({ name: readQuery(request, "name") }));
  };
}

module.exports = { makeHelloHandler };
