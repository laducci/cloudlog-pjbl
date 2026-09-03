# Entrega 3 — MongoDB Atlas e Azure Functions CRUD

## Grupo

- Camilla Uber — **confirmar sobrenome antes da entrega**
- João Davi
- Laura Guillarducci

## Objetivo

Integrar o frontend CloudLog ao MongoDB Atlas por meio de quatro Azure Functions responsáveis por inserir, pesquisar, alterar e excluir entregas.

## Recursos

- Projeto MongoDB Atlas: `PREENCHER`
- Cluster: `PREENCHER`
- Banco: `cloudlog`
- Coleção: `deliveries`
- Function App: `PREENCHER`
- Frontend: `PREENCHER`
- GitHub: `PREENCHER`

## Funções implementadas

| Função | Método | Endpoint público |
|---|---|---|
| searchDeliveries | GET | `PREENCHER/api/deliveries` |
| createDelivery | POST | `PREENCHER/api/deliveries` |
| updateDelivery | PUT | `PREENCHER/api/deliveries/{id}` |
| deleteDelivery | DELETE | `PREENCHER/api/deliveries/{id}` |

## Evidência do MongoDB Atlas

`INSERIR: cluster criado`

`INSERIR: banco cloudlog e coleção deliveries`

## Evidência das quatro Azure Functions

`INSERIR: portal com searchDeliveries, createDelivery, updateDelivery e deleteDelivery`

## Evidência do frontend

### Inserir

`INSERIR: formulário e registro criado`

### Pesquisar

`INSERIR: busca retornando o registro`

### Alterar

`INSERIR: registro antes e depois da alteração`

### Excluir

`INSERIR: exclusão e lista atualizada`

## Conclusão

A integração demonstrou as quatro operações de persistência da aplicação CloudLog. O frontend React enviou requisições HTTP às Azure Functions, que validaram os dados e acessaram a coleção `deliveries` no MongoDB Atlas. As credenciais foram mantidas apenas nas configurações protegidas da Function App.
