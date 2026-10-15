# CloudLog — PJBL Azure Functions

Aplicação acadêmica de gestão logística com frontend React, Azure Functions e MongoDB Atlas. O projeto atende às atividades de criação de endpoint HTTP, frontend com duas telas, publicação no Azure Static Web Apps e CRUD serverless.

## Funcionalidades

- Visão operacional com indicadores, telemetria e alertas.
- Gestão de entregas com pesquisa e filtro.
- Inserção de entrega via Azure Function (`POST`).
- Pesquisa de entregas via Azure Function (`GET`).
- Alteração de entrega via Azure Function (`PUT`).
- Exclusão de entrega via Azure Function (`DELETE`).
- Endpoint introdutório da primeira atividade (`GET /api/hello?name=Laura`).
- Modo de demonstração com dados mockados.

## Endereços publicados

- **Site no Azure Static Web Apps:** <https://polite-mushroom-0b05fa610.3.azurestaticapps.net>
- **Endpoint GET no Azure Functions:** <https://polite-mushroom-0b05fa610.3.azurestaticapps.net/api/hello?name=Laura>
- **Repositório público no GitHub:** <https://github.com/laducci/cloudlog-pjbl>
- **Mock Apidog (opcional):** não utilizado; o projeto possui mocks locais em `src/mockData.js`.

## Executar o frontend

1. Instale o Node.js 20 LTS ou superior.
2. Instale as dependências com `npm install`.
3. Copie `.env.example` para `.env.local`.
4. Para visualizar sem backend, mantenha `VITE_USE_MOCKS=true`.
5. Inicie com `npm run dev`.

## Executar as Azure Functions localmente

1. Instale o Azure Functions Core Tools.
2. Entre em `api` e execute `npm install`.
3. Copie `local.settings.example.json` para `local.settings.json`.
4. Preencha `MONGODB_ATLAS_URI` com a conexão do Atlas — nunca publique essa senha no GitHub.
5. Execute `npm start` dentro de `api`.
6. No frontend, use `VITE_API_BASE_URL=http://localhost:7071` e `VITE_USE_MOCKS=false`.

## Contrato dos endpoints

| Operação | Método e rota | Entrada | Resultado esperado |
|---|---|---|---|
| Teste inicial | `GET /api/hello?name=Laura` | Query opcional `name` | JSON de saudação e confirmação de funcionamento. |
| Pesquisar | `GET /api/deliveries?status=Em%20rota&search=CL` | Query opcional `status` e `search` | Lista de até 100 entregas e total. |
| Inserir | `POST /api/deliveries` | JSON da entrega | Registro criado, HTTP 201. |
| Alterar | `PUT /api/deliveries/{id}` | ID na rota e campos JSON | Registro atualizado, HTTP 200. |
| Excluir | `DELETE /api/deliveries/{id}` | ID na rota | Confirmação da exclusão, HTTP 200. |

Exemplo de corpo JSON:

```json
{
  "code": "CL-2050",
  "customer": "Mercado Aurora",
  "destination": "Curitiba, PR",
  "driver": "Marcos Silva",
  "status": "Em rota",
  "eta": "Hoje, 17:30",
  "progress": 35
}
```

## Configuração no Azure

Na Function App, registre como configurações de ambiente:

- `MONGODB_ATLAS_URI`
- `MONGODB_ATLAS_DATABASE=cloudlog`
- `MONGODB_ATLAS_COLLECTION=deliveries`

Em CORS, autorize apenas a URL publicada do Azure Static Web Apps e, durante testes locais, `http://localhost:5173`. No frontend publicado, defina `VITE_API_BASE_URL` com a URL da Function App e `VITE_USE_MOCKS=false` antes do build.

## Projetos backend (TypeScript · Vertical Slice + Clean Architecture · ArchUnitTS)

| Projeto | Pasta | Papel | Rotas / gatilhos |
|---|---|---|---|
| Serviço de Entregas | `api/` | Microsserviço (publicado no Azure Static Web Apps) | `GET/POST /api/deliveries`, `PUT/DELETE /api/deliveries/{id}`, `GET /api/hello` |
| Serviço de Alertas | `services/alerts/` | Microsserviço (Function App própria) | ServiceBusQueueTrigger `processDeliveryEvent`, `GET /api/alerts` |
| BFF Web | `bff/web/` | Backend for Frontend do painel | `GET /api/web/dashboard`, `GET /api/web/deliveries` |

Cada projeto segue a mesma organização: `src/domain` (entidades e portas), `src/features/<fatia>` (UseCase + handler + function), `src/infrastructure` (adaptadores), `src/shared/http` e `src/bootstrap/container.ts` (Composition Root).

Testes (em cada pasta de projeto):

```bash
npm install
npm run test:arch   # testes de arquitetura com ArchUnitTS (archunit)
npm run test:unit   # testes unitários (Vitest)
npm test            # todos
```

O workflow `.github/workflows/backend-tests.yml` executa typecheck, build e os testes dos três projetos a cada push.

## Eventos (Arquitetura Orientada a Eventos)

Inserir, alterar e excluir entregas publicam os eventos `DeliveryCreated`, `DeliveryUpdated` e `DeliveryDeleted` pela porta `DeliveryEventPublisher`.

- Com `SERVICEBUS_CONNECTION` (e opcionalmente `SERVICEBUS_QUEUE`, padrão `cloudlog-delivery-events`), os eventos vão para uma fila do Azure Service Bus.
- Sem essa configuração, os eventos apenas são registrados em log; a API continua funcionando.
- O consumidor `processDeliveryEvent` agora fica no microsserviço `services/alerts`, que grava os alertas no seu próprio banco (Azure Table Storage, ou memória sem configuração) e os expõe em `GET /api/alerts` para o BFF.

## Estrutura

- `src/`: frontend React.
- `api/`: cinco Azure Functions; quatro formam o CRUD exigido.
- `services/alerts/`: microsserviço de alertas.
- `bff/web/`: BFF Web.
- `*/tests/`: testes unitários (Vitest) e de arquitetura (ArchUnitTS).
- `docs/`: roteiro e modelos para as três entregas.
- `GRUPO.md`: integrantes e link do GitHub.
- `Prompt.md`: prompt de IAG exigido.

## Segurança e encerramento

Nunca versionar `local.settings.json`, `.env.local`, senha do banco, connection string ou chaves da Azure. Após a primeira atividade e somente depois de enviar as evidências, exclua o grupo de recursos criado exclusivamente para ela. Não exclua a Function App usada nas entregas 2 e 3 antes da avaliação.
