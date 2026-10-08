# CloudLog — Arquitetura do Backend (Vertical Slice + Clean Architecture + SOLID)

**Integrantes:** Camilla Augusta Uber · João Davi · Laura Guillarducci
**Branch:** `refactor/vertical-slice-clean-architecture`
**Escopo:** `api/` — Azure Functions (Node.js, modelo v4) + MongoDB Atlas

## 1. Visão geral

O backend foi reorganizado em **fatias verticais** (uma pasta por funcionalidade), e cada fatia segue as camadas da **Clean Architecture**. O contrato HTTP consumido pelo frontend não mudou (mesmas rotas, status e formato de JSON).

```
api/src/
├── index.js                     # registra as fatias
├── bootstrap/container.js       # Composition Root (injeção de dependência)
├── domain/                      # Entidades, Value Objects, erros e portas (núcleo)
│   ├── delivery/Delivery.js
│   ├── delivery/DeliveryStatus.js
│   ├── errors.js
│   └── ports/deliveryPorts.js
├── features/                    # FATIAS VERTICAIS
│   ├── createDelivery/   (CreateDeliveryUseCase · createDelivery.handler · createDelivery.function)
│   ├── searchDeliveries/ (SearchDeliveriesUseCase · searchDeliveries.handler · searchDeliveries.function)
│   ├── updateDelivery/   (UpdateDeliveryUseCase · updateDelivery.handler · updateDelivery.function)
│   ├── deleteDelivery/   (DeleteDeliveryUseCase · deleteDelivery.handler · deleteDelivery.function)
│   └── hello/            (SayHelloUseCase · hello.handler · hello.function)
├── infrastructure/              # Adaptadores de saída
│   ├── persistence/mongo/       (MongoConnection · MongoDeliveryRepository)
│   ├── persistence/memory/      (InMemoryDeliveryRepository)
│   └── time/SystemClock.js
└── shared/http/                 # httpResponse · requestReader · errorMapper
```

| Camada (Clean Architecture) | Onde está | Pode depender de |
|---|---|---|
| Entities | `domain/` | nada (puro) |
| Use Cases | `features/*/*UseCase.js` | `domain/` |
| Interface Adapters | `features/*/*.handler.js`, `shared/http/`, `infrastructure/` | `domain/` (+ use cases via injeção) |
| Frameworks & Drivers | `features/*/*.function.js`, `bootstrap/`, `@azure/functions`, `mongodb` | tudo (borda) |

## 2. Princípios SOLID aplicados

| Princípio | Como aparece no código |
|---|---|
| **S** — Responsabilidade Única | Regras de validação na entidade `Delivery`; orquestração no use case; tradução HTTP no handler; persistência no repositório; registro da rota no `.function.js`. |
| **O** — Aberto/Fechado | Nova funcionalidade = nova pasta em `features/`, sem alterar as existentes. Novos erros entram como uma linha em `errorStatusTable` (`errorMapper.js`). |
| **L** — Substituição de Liskov | `MongoDeliveryRepository` e `InMemoryDeliveryRepository` cumprem as mesmas portas e são intercambiáveis (testes e `DELIVERY_REPOSITORY=memory`). `assertPort` valida o contrato. |
| **I** — Segregação de Interface | Portas pequenas: `DeliveryWriter`, `DeliveryReader`, `DeliveryUpdater`, `DeliveryRemover`, `Clock`. Cada use case recebe apenas a que usa. |
| **D** — Inversão de Dependência | Use cases dependem de abstrações (portas); só o `bootstrap/container.js` conhece as classes concretas e faz a injeção. |

## 3. Diagrama de Classes

### 3.1 Fatias verticais e domínio

![Diagrama de classes 1](img/classes-1-slices-dominio.png)

```mermaid
---
title: "Diagrama de Classes 1/2 — Fatias verticais (Application) e Domínio"
config:
  layout: elk
  class:
    hideEmptyMembersBox: true
---
classDiagram
direction TB

namespace features_createDelivery {
  class CreateDeliveryUseCase {
    <<UseCase>>
    -deliveryWriter: DeliveryWriter
    -clock: Clock
    +execute(input) Promise~Delivery~
  }
}
namespace features_searchDeliveries {
  class SearchDeliveriesUseCase {
    <<UseCase>>
    -deliveryReader: DeliveryReader
    +execute(filters) Promise~Result~
  }
}
namespace features_updateDelivery {
  class UpdateDeliveryUseCase {
    <<UseCase>>
    -deliveryUpdater: DeliveryUpdater
    -clock: Clock
    +execute(id, input) Promise~Delivery~
  }
}
namespace features_deleteDelivery {
  class DeleteDeliveryUseCase {
    <<UseCase>>
    -deliveryRemover: DeliveryRemover
    +execute(id) Promise~Result~
  }
}
namespace features_hello {
  class SayHelloUseCase {
    <<UseCase>>
    -clock: Clock
    +execute(input) Greeting
  }
}

namespace domain {
  class Delivery {
    <<Entity>>
    +id: string
    +code: string
    +customer: string
    +destination: string
    +driver: string
    +status: string
    +eta: string
    +progress: number
    +createdAt: Date
    +updatedAt: Date
    +create(props, now)$ Delivery
    +validateChanges(props, now)$ Changes
    +toPrimitives() object
  }
  class DeliveryStatus {
    <<ValueObject>>
    +PENDING: string$
    +IN_ROUTE: string$
    +DELAYED: string$
    +DELIVERED: string$
    +values()$ string[]
    +assertValid(value)$ string
  }
  class DeliveryWriter {
    <<interface>>
    +insert(delivery)
  }
  class DeliveryReader {
    <<interface>>
    +search(criteria)
  }
  class DeliveryUpdater {
    <<interface>>
    +update(id, changes)
  }
  class DeliveryRemover {
    <<interface>>
    +remove(id)
  }
  class Clock {
    <<interface>>
    +now() Date
  }
  class DomainError {
    <<abstract>>
  }
  class ValidationError
  class NotFoundError
  class InvalidIdentifierError
}

CreateDeliveryUseCase ..> Delivery : «create»
UpdateDeliveryUseCase ..> Delivery : valida alterações
CreateDeliveryUseCase --> "1" DeliveryWriter
CreateDeliveryUseCase --> "1" Clock
SearchDeliveriesUseCase --> "1" DeliveryReader
UpdateDeliveryUseCase --> "1" DeliveryUpdater
UpdateDeliveryUseCase --> "1" Clock
DeleteDeliveryUseCase --> "1" DeliveryRemover
SayHelloUseCase --> "1" Clock
UpdateDeliveryUseCase ..> NotFoundError : «throws»
DeleteDeliveryUseCase ..> NotFoundError : «throws»

Delivery ..> DeliveryStatus : usa
Delivery ..> ValidationError : «throws»
DomainError <|-- ValidationError
DomainError <|-- NotFoundError
ValidationError <|-- InvalidIdentifierError
```

### 3.2 Portas, adaptadores e Composition Root

![Diagrama de classes 2](img/classes-2-portas-adaptadores.png)

```mermaid
---
title: "Diagrama de Classes 2/2 — Portas, Adaptadores e Composition Root (DIP)"
config:
  layout: elk
  class:
    hideEmptyMembersBox: true
---
classDiagram
direction BT

class DeliveryWriter {
  <<interface>>
  +insert(delivery) Promise~object~
}
class DeliveryReader {
  <<interface>>
  +search(criteria) Promise~object[]~
}
class DeliveryUpdater {
  <<interface>>
  +update(id, changes) Promise~object~
}
class DeliveryRemover {
  <<interface>>
  +remove(id) Promise~boolean~
}
class Clock {
  <<interface>>
  +now() Date
}

namespace infrastructure {
  class MongoDeliveryRepository {
    <<Adapter>>
    -connection: MongoConnection
    +insert(delivery)
    +search(criteria)
    +update(id, changes)
    +remove(id)
    -toObjectId(id) ObjectId
  }
  class InMemoryDeliveryRepository {
    <<Adapter>>
    -items: object[]
    +insert(delivery)
    +search(criteria)
    +update(id, changes)
    +remove(id)
  }
  class MongoConnection {
    -uri: string
    -databaseName: string
    -collectionName: string
    -client: MongoClient
    +fromEnvironment(env)$ MongoConnection
    +getCollection() Promise~Collection~
  }
  class SystemClock {
    <<Adapter>>
    +now() Date
  }
}

namespace bootstrap {
  class CompositionRoot {
    <<container.js>>
    +buildContainer(env)$ Container
  }
}

MongoDeliveryRepository ..|> DeliveryWriter
MongoDeliveryRepository ..|> DeliveryReader
MongoDeliveryRepository ..|> DeliveryUpdater
MongoDeliveryRepository ..|> DeliveryRemover
InMemoryDeliveryRepository ..|> DeliveryWriter
InMemoryDeliveryRepository ..|> DeliveryReader
InMemoryDeliveryRepository ..|> DeliveryUpdater
InMemoryDeliveryRepository ..|> DeliveryRemover
SystemClock ..|> Clock
MongoDeliveryRepository *-- "1" MongoConnection

CompositionRoot ..> MongoDeliveryRepository : «instantiate»
CompositionRoot ..> InMemoryDeliveryRepository : «instantiate» (DELIVERY_REPOSITORY=memory)
CompositionRoot ..> SystemClock : «instantiate»
```

## 4. Diagrama de Componentes

### 4.1 Visão do backend

Legenda: seta tracejada = dependência/interface requerida; linha sólida ligada ao círculo = interface fornecida (realização da porta).

![Diagrama de componentes](img/componentes.png)

```mermaid
---
title: "Diagrama de Componentes UML — Backend CloudLog (Azure Functions)"
config:
  layout: elk
---
flowchart TB
  front["«component»<br/><b>Frontend React</b><br/>Azure Static Web Apps"]
  atlas[("«database»<br/><b>MongoDB Atlas</b><br/>cloudlog.deliveries")]

  subgraph api["«subsystem» CloudLog API — Azure Function App (Node.js, modelo v4)"]
    httpApi(("HTTP /api"))

    subgraph features["features/ — Fatias Verticais (cada fatia = function → handler → use case)"]
      direction LR
      s1["«slice»<br/><b>createDelivery</b><br/>POST /deliveries<br/>CreateDeliveryUseCase"]
      s2["«slice»<br/><b>searchDeliveries</b><br/>GET /deliveries<br/>SearchDeliveriesUseCase"]
      s3["«slice»<br/><b>updateDelivery</b><br/>PUT /deliveries/{id}<br/>UpdateDeliveryUseCase"]
      s4["«slice»<br/><b>deleteDelivery</b><br/>DELETE /deliveries/{id}<br/>DeleteDeliveryUseCase"]
      s5["«slice»<br/><b>hello</b><br/>GET /hello<br/>SayHelloUseCase"]
    end

    sharedHttp["«component»<br/><b>shared/http</b><br/>httpResponse · requestReader · errorMapper"]
    root["«component»<br/><b>Composition Root</b><br/>bootstrap/container.js"]

    subgraph domain["domain/ — Núcleo: Entidades e Portas"]
      direction LR
      entity["«component»<br/><b>Delivery Domain</b><br/>Delivery · DeliveryStatus · Errors"]
      pW(("Delivery<br/>Writer"))
      pR(("Delivery<br/>Reader"))
      pU(("Delivery<br/>Updater"))
      pD(("Delivery<br/>Remover"))
      pC(("Clock"))
    end

    subgraph infra["infrastructure/ — Adaptadores"]
      direction LR
      mongoRepo["«component»<br/><b>MongoDeliveryRepository</b><br/>+ MongoConnection"]
      memRepo["«component»<br/><b>InMemoryDeliveryRepository</b>"]
      clock["«component»<br/><b>SystemClock</b>"]
    end
  end

  front -- "HTTPS/JSON" --> httpApi
  httpApi --- s1 & s2 & s3 & s4 & s5
  features -. "«use»" .-> sharedHttp
  features -. "obtém casos de uso" .-> root
  root -. "«instantiate»" .-> infra

  s1 -.-> pW
  s2 -.-> pR
  s3 -.-> pU
  s4 -.-> pD
  s1 & s3 & s5 -.-> pC
  s1 & s3 -. "«use»" .-> entity

  pW & pR & pU & pD --- mongoRepo
  pW & pR & pU & pD --- memRepo
  pC --- clock
  mongoRepo -- "MongoDB Driver / TLS" --> atlas

  classDef comp fill:#E8F0FE,stroke:#1A4E8A,color:#0B2545;
  classDef port fill:#FFFFFF,stroke:#1A4E8A,color:#0B2545;
  classDef ext fill:#EDEDED,stroke:#666,color:#222;
  class s1,s2,s3,s4,s5,sharedHttp,entity,mongoRepo,memRepo,clock,root comp;
  class pW,pR,pU,pD,pC,httpApi port;
  class front,atlas ext;
```

### 4.2 Detalhe de uma fatia vertical

![Detalhe da fatia](img/componentes-fatia.png)

```mermaid
---
title: "Detalhe de uma Fatia Vertical — createDelivery (camadas da Clean Architecture)"
config:
  layout: elk
---
flowchart TB
  subgraph slice["features/createDelivery — fatia vertical"]
    direction TB
    fn["«Frameworks & Drivers»<br/><b>createDelivery.function.js</b><br/>app.http POST /deliveries"]
    hd["«Interface Adapter»<br/><b>createDelivery.handler.js</b><br/>makeCreateDeliveryHandler()"]
    uc["«Application / Use Case»<br/><b>CreateDeliveryUseCase.js</b><br/>execute(input)"]
    fn --> hd --> uc
  end
  az["«framework»<br/>@azure/functions"]
  sh["«component»<br/>shared/http<br/>readJsonBody · created · toHttpError"]
  root["«component»<br/>bootstrap/container.js"]
  en["«Entity»<br/>Delivery · DeliveryStatus"]
  pW(("DeliveryWriter"))
  pC(("Clock"))
  mongo["«Adapter»<br/>MongoDeliveryRepository"]

  fn -.-> az
  fn -. "injeção do use case" .-> root
  hd -.-> sh
  uc -.-> en
  uc -. "requer" .-> pW
  uc -. "requer" .-> pC
  pW --- mongo

  classDef c fill:#E8F0FE,stroke:#1A4E8A,color:#0B2545;
  classDef p fill:#FFFFFF,stroke:#1A4E8A,color:#0B2545;
  classDef e fill:#EDEDED,stroke:#666,color:#222;
  class fn,hd,uc,sh,root,en,mongo c;
  class pW,pC p;
  class az e;
```

## 5. Testes

```bash
cd api
npm install
npm test            # todos (unitários + arquitetura)
npm run test:unit   # domínio, casos de uso, handlers e repositório
npm run test:arch   # regras de dependência (estilo ArchUnit)
```

Os testes de arquitetura (`api/tests/architecture/architecture.test.js`) garantem que: o domínio não depende de nada externo; use cases só dependem do domínio; fatias não se importam entre si; `mongodb` fica restrito ao adaptador Mongo; `@azure/functions` fica restrito aos `*.function.js`; só o Composition Root instancia a infraestrutura; e toda fatia possui UseCase, handler e function.
