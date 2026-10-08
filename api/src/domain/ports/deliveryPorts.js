/**
 * Portas de saída (Clean Architecture) segregadas por necessidade (ISP).
 * Cada caso de uso depende apenas da porta que utiliza, e não de um
 * repositório "gordo". As implementações concretas ficam em infrastructure/.
 *
 *  DeliveryWriter   -> insert(deliveryPrimitives): Promise<deliveryPrimitives com _id>
 *  DeliveryReader   -> search({ status, text, limit }): Promise<deliveryPrimitives[]>
 *  DeliveryUpdater  -> update(id, changes): Promise<deliveryPrimitives | null>
 *  DeliveryRemover  -> remove(id): Promise<boolean>
 *  Clock            -> now(): Date
 */
const Ports = Object.freeze({
  DeliveryWriter: ["insert"],
  DeliveryReader: ["search"],
  DeliveryUpdater: ["update"],
  DeliveryRemover: ["remove"],
  Clock: ["now"],
});

/**
 * Garante, na construção do caso de uso, que a dependência injetada
 * cumpre o contrato da porta (substituição segura — LSP).
 */
function assertPort(portName, implementation) {
  const methods = Ports[portName];
  if (!methods) throw new Error(`Porta desconhecida: ${portName}.`);
  const missing = methods.filter((method) => typeof implementation?.[method] !== "function");
  if (missing.length) throw new TypeError(`${portName} inválido: métodos ausentes ${missing.join(", ")}.`);
  return implementation;
}

module.exports = { Ports, assertPort };
