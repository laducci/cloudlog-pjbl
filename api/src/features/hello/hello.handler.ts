import { ok } from "../../shared/http/httpResponse";
import { readQuery } from "../../shared/http/requestReader";
import type { HttpRequestLike } from "../../shared/http/types";
import type { SayHelloUseCase } from "./SayHelloUseCase";

export function makeHelloHandler({ sayHello }: { sayHello: SayHelloUseCase }) {
  return async (request: HttpRequestLike) => ok(sayHello.execute({ name: readQuery(request, "name") }));
}
