/** Fábrica de respostas HTTP JSON com UTF-8 (camada de apresentação). */
function json(status, body) {
  return {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

const ok = (body) => json(200, body);
const created = (body) => json(201, body);

module.exports = { json, ok, created };
