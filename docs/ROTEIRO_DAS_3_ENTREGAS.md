# Roteiro das três entregas — CloudLog

Este roteiro separa as ações individuais, as ações do grupo e as evidências exigidas. Campos marcados como `PREENCHER` dependem das contas dos alunos e não devem ser inventados.

## Visão geral

| Entrega | Resultado | Responsável |
|---|---|---|
| 1 | Conta Azure for Students, módulo Microsoft Learn e primeiro endpoint HTTP | Cada integrante executa e captura sua própria evidência |
| 2 | Frontend CloudLog, GET via Azure Function, GitHub e Azure Static Web Apps | Grupo PJBL |
| 3 | MongoDB Atlas, quatro Azure Functions CRUD e frontend consumindo as quatro | Grupo PJBL |

## Entrega 1 — Azure for Students e primeira Function

### 1. Ativação individual

1. Acesse <https://azure.microsoft.com/pt-br/free/students>.
2. Use a conta institucional `@pucpr.edu.br`.
3. Conclua a verificação acadêmica solicitada pela Microsoft.
4. Entre em <https://portal.azure.com> e confirme que a assinatura **Azure for Students** está ativa.
5. Cada integrante conclui o módulo guiado indicado pelo professor em sua própria conta Microsoft Learn.

### 2. Criação dos recursos

No portal Azure, crie um grupo de recursos exclusivo, por exemplo `rg-cloudlog-atividade1`. Em seguida, crie uma Function App com:

- Plano: **Flex Consumption**, quando disponível; caso contrário, **Consumption**.
- Região: **East US 2** ou uma região permitida pela assinatura.
- Pilha: **Node.js**.
- Versão: escolha uma versão LTS oferecida pelo portal.
- Memória/instâncias: menor opção disponível.
- Nome globalmente exclusivo, por exemplo `cloudlog-fn-grupoXX`.
- Application Insights: pode ser desativado nesta atividade se o professor não exigir e o objetivo for minimizar recursos.

Depois da implantação, publique a função `helloCloudLog` deste repositório ou crie no portal um gatilho HTTP equivalente.

### 3. Endpoint documentado

- Método: `GET`
- Rota: `https://NOME-DA-FUNCTION-APP.azurewebsites.net/api/hello`
- Parâmetro de entrada: `name`, texto opcional enviado na query string.
- Exemplo: `?name=Laura`
- Resultado esperado: HTTP 200 e JSON semelhante a:

```json
{
  "message": "Olá, Laura! A Azure Function do CloudLog está funcionando.",
  "input": { "name": "Laura" },
  "service": "CloudLog API",
  "timestamp": "DATA_E_HORA"
}
```

### 4. Capturas obrigatórias

Cada integrante deve capturar:

1. Assinatura Azure for Students ativa, com nome do aluno visível e sem exibir informações sensíveis.
2. Conclusão do módulo no Microsoft Learn, com nome/perfil do aluno.
3. Visão geral da Function App com nome, status e grupo de recursos.
4. Lista de funções mostrando `helloCloudLog`.
5. Teste no navegador ou painel de teste exibindo URL, parâmetro e JSON retornado.

Não exponha chaves, senhas, connection strings, IDs de cobrança ou tokens nas capturas.

### 5. Exclusão

Somente depois de enviar as evidências, exclua `rg-cloudlog-atividade1`. Digitar o nome do grupo de recursos confirma a exclusão. Não coloque no mesmo grupo recursos que serão usados nas entregas 2 e 3.

## Entrega 2 — Frontend, GET, GitHub e Static Web Apps

### O que já está implementado neste repositório

- Tela **Visão operacional**.
- Tela **Entregas**.
- Modo mock local.
- Comunicação GET com `GET /api/deliveries`.
- Arquivos `GRUPO.md`, `Prompt.md` e `README.md`.
- Configuração de SPA para Azure Static Web Apps.

### Publicar no GitHub

1. Criar um repositório público, por exemplo `cloudlog-pjbl`.
2. Conferir se `.env`, `.env.local`, `local.settings.json` e senhas não estão no commit.
3. Enviar o projeto para a branch `main`.
4. Copiar a URL pública para `GRUPO.md` e `README.md`.

### Publicar no Azure Static Web Apps

1. No portal Azure, crie **Static Web App**.
2. Plano: **Free**.
3. Conecte o repositório GitHub e a branch `main`.
4. Preset de build: **React** ou **Vite**, conforme aparecer no portal.
5. Local do aplicativo: `/`.
6. Local da API: deixe vazio se a Function App for um recurso separado.
7. Local de saída: `dist`.
8. Antes do build, configure `VITE_API_BASE_URL=https://NOME-DA-FUNCTION-APP.azurewebsites.net` e `VITE_USE_MOCKS=false` como variáveis usadas pelo workflow.
9. Aguarde o GitHub Actions concluir e abra a URL pública.
10. Na Function App, configure CORS para autorizar exatamente essa URL do Static Web Apps.

### Capturas recomendadas

1. Repositório público, incluindo `GRUPO.md`, `Prompt.md` e `README.md`.
2. GitHub Actions concluído com sucesso.
3. Visão geral do Azure Static Web Apps e URL.
4. Tela Visão operacional aberta na URL pública.
5. Tela Entregas mostrando registros vindos do GET da Azure Function.
6. Aba Network do navegador ou teste da Function evidenciando o GET 200.

### Entrega no AVA

- Link público do GitHub.
- Link público do Azure Static Web Apps.
- Link público da Azure Function pedida pelo professor.
- Arquivo MD solicitado, que pode ser o `GRUPO.md` exportado ou anexado.

## Entrega 3 — MongoDB Atlas e CRUD

### 1. Criar o Atlas

1. Acesse <https://www.mongodb.com/students> e conclua o cadastro/benefício disponível.
2. Crie um projeto chamado `CloudLog PJBL`.
3. Crie um cluster gratuito, selecionando Azure e uma região disponível quando possível.
4. Crie um usuário de banco com senha forte e exclusiva.
5. Em Network Access, autorize o acesso necessário para a Function App. Para atividade acadêmica, se for indispensável liberar acesso amplo temporariamente, registre o risco e remova a regra após a avaliação.
6. Obtenha a connection string em **Connect > Drivers > Node.js**.
7. Crie o banco `cloudlog` e a coleção `deliveries`.

### 2. Configurar a Function App

Nas configurações de ambiente da Function App, adicione:

- `MONGODB_ATLAS_URI`: connection string completa, somente no Azure.
- `MONGODB_ATLAS_DATABASE`: `cloudlog`.
- `MONGODB_ATLAS_COLLECTION`: `deliveries`.

Não grave a URI em arquivo versionado. O arquivo `api/local.settings.example.json` contém apenas um modelo.

### 3. Quatro funções exigidas

| Função | Método | Rota | Evidência |
|---|---|---|---|
| `searchDeliveries` | GET | `/api/deliveries` | Lista inicial e registro inserido |
| `createDelivery` | POST | `/api/deliveries` | Novo registro aparecendo no Atlas e frontend |
| `updateDelivery` | PUT | `/api/deliveries/{id}` | Alteração de status/progresso refletida no Atlas e frontend |
| `deleteDelivery` | DELETE | `/api/deliveries/{id}` | Registro removido do frontend e Atlas |

### 4. Sequência ideal para evidenciar o CRUD

1. Abra o Atlas mostrando a coleção `deliveries` vazia ou com registros iniciais.
2. Abra a tela Entregas do site publicado.
3. Clique em **Nova entrega**, preencha os campos e salve; capture o resultado.
4. Atualize o Atlas e capture o documento inserido.
5. Pesquise pelo código criado no frontend; capture a filtragem.
6. Edite o registro, mude status e progresso e capture o resultado.
7. Atualize o Atlas e capture os campos alterados.
8. Exclua o registro no frontend e capture a lista sem o item.
9. Atualize o Atlas e capture a ausência do documento.

### 5. Evidências obrigatórias

- Projeto e cluster Atlas criados.
- Banco `cloudlog` e coleção `deliveries`.
- Lista das quatro Azure Functions no portal.
- Inserção, pesquisa, alteração e exclusão funcionando no frontend.
- Nome dos alunos no documento.

## Checklist final

- [ ] Nome correto de Camilla confirmado e padronizado.
- [ ] Todos os integrantes fizeram a evidência individual da entrega 1.
- [ ] URLs públicas preenchidas em `README.md` e `GRUPO.md`.
- [ ] `Prompt.md` presente.
- [ ] Pelo menos duas telas demonstradas.
- [ ] GET real demonstrado, com `VITE_USE_MOCKS=false`.
- [ ] Quatro operações CRUD demonstradas com MongoDB Atlas.
- [ ] Nenhuma senha ou chave no GitHub ou nas capturas.
- [ ] Recursos exclusivos da atividade 1 excluídos somente após o envio.

