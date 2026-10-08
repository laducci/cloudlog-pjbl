const FIXED_NOW = new Date("2026-10-08T12:00:00.000Z");

const fixedClock = { now: () => FIXED_NOW };

function fakeRequest({ body, query = {}, params = {}, invalidJson = false } = {}) {
  return {
    params,
    query: new URLSearchParams(query),
    json: async () => {
      if (invalidJson) throw new SyntaxError("Unexpected token");
      return body;
    },
  };
}

const fakeContext = () => ({ errors: [], error(e) { this.errors.push(e); } });

const validDelivery = () => ({
  code: "CL-2050",
  customer: "Mercado Aurora",
  destination: "Curitiba, PR",
  driver: "Marcos Silva",
  status: "Em rota",
  eta: "Hoje, 17:30",
  progress: 35,
});

module.exports = { FIXED_NOW, fixedClock, fakeRequest, fakeContext, validDelivery };
