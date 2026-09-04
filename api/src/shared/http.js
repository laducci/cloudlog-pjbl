const allowedStatuses = new Set(["Pendente", "Em rota", "Atrasada", "Entregue"]);

const json = (status, body) => ({
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

function validateDelivery(payload, partial = false) {
  const fields = ["code", "customer", "destination", "driver", "status", "eta"];
  if (!partial) {
    const missing = fields.filter((field) => !String(payload?.[field] || "").trim());
    if (missing.length) return `Campos obrigatórios ausentes: ${missing.join(", ")}.`;
  }
  if (payload?.status && !allowedStatuses.has(payload.status)) return "Status inválido.";
  if (payload?.progress !== undefined) {
    const progress = Number(payload.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) return "Progresso deve estar entre 0 e 100.";
  }
  return null;
}

function normalizeDelivery(payload) {
  const normalized = {};
  for (const field of ["code", "customer", "destination", "driver", "status", "eta"]) {
    if (payload[field] !== undefined) normalized[field] = String(payload[field]).trim();
  }
  if (payload.progress !== undefined) normalized.progress = Number(payload.progress);
  return normalized;
}

function serverError(context, error) {
  context.error(error);
  return json(500, { message: "Não foi possível concluir a operação no banco de dados." });
}

module.exports = { json, validateDelivery, normalizeDelivery, serverError };
