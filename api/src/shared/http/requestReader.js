/** Erro de requisição malformada (pertence à apresentação, não ao domínio). */
class InvalidRequestError extends Error {
  constructor(message = "O corpo da requisição deve ser um JSON válido.") {
    super(message);
    this.name = "InvalidRequestError";
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new InvalidRequestError();
    throw error;
  }
}

function readQuery(request, name) {
  return request.query?.get(name)?.trim() || undefined;
}

module.exports = { InvalidRequestError, readJsonBody, readQuery };
