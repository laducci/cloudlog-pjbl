const { ValidationError } = require("../errors");
const { DeliveryStatus } = require("./DeliveryStatus");

const TEXT_FIELDS = ["code", "customer", "destination", "driver", "status", "eta"];

function normalizeText(value) {
  return String(value).trim();
}

function normalizeProgress(value) {
  const progress = Number(value);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new ValidationError("Progresso deve estar entre 0 e 100.");
  }
  return progress;
}

/**
 * Entidade de domínio Entrega (RF-03).
 * Concentra as regras de validação e normalização que antes ficavam
 * espalhadas no helper HTTP (SRP: a regra de negócio mora no domínio).
 */
class Delivery {
  static TEXT_FIELDS = TEXT_FIELDS;

  constructor({ id, code, customer, destination, driver, status, eta, progress, createdAt, updatedAt }) {
    this.id = id;
    this.code = code;
    this.customer = customer;
    this.destination = destination;
    this.driver = driver;
    this.status = status;
    this.eta = eta;
    this.progress = progress;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** Cria uma nova entrega válida a partir dos dados recebidos. */
  static create(props, now) {
    const missing = TEXT_FIELDS.filter((field) => !String(props?.[field] ?? "").trim());
    if (missing.length) throw new ValidationError(`Campos obrigatórios ausentes: ${missing.join(", ")}.`);

    const data = {};
    for (const field of TEXT_FIELDS) data[field] = normalizeText(props[field]);
    DeliveryStatus.assertValid(data.status);
    if (props.progress !== undefined) data.progress = normalizeProgress(props.progress);

    return new Delivery({ ...data, createdAt: now, updatedAt: now });
  }

  /** Valida e normaliza uma alteração parcial (PUT). */
  static validateChanges(props, now) {
    const changes = {};
    for (const field of TEXT_FIELDS) {
      if (props?.[field] !== undefined) changes[field] = normalizeText(props[field]);
    }
    if (changes.status !== undefined) DeliveryStatus.assertValid(changes.status);
    if (props?.progress !== undefined) changes.progress = normalizeProgress(props.progress);

    if (!Object.keys(changes).length) throw new ValidationError("Informe ao menos um campo para alteração.");
    changes.updatedAt = now;
    return changes;
  }

  /** Representação serializável usada pelas portas de saída e pela API. */
  toPrimitives() {
    const { id, ...rest } = this;
    const data = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));
    return id === undefined ? data : { ...data, _id: id };
  }
}

module.exports = { Delivery };
