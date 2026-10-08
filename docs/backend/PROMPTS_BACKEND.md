# Prompts utilizados para modificar o backend

**Ferramenta de IAG:** Claude (Anthropic), no aplicativo Claude (modo Cowork), com acesso ao repositório `laducci/cloudlog-pjbl`.
**Atividade:** aplicar Vertical Slice, Clean Architecture e SOLID no backend do TDE 2.
**Branch gerada:** `refactor/vertical-slice-clean-architecture`

## Prompt 1 — pedido da refatoração

> Utilizar IA Generativa para aplicar o VERTICAL SLICE e CLEAN ARCHITECTURE e SOLID no backend da aplicação TDE 2.
> Utilizar o código da aplicação que está sendo criada no TDE 2.
>
> Em documento PDF entregar:
>
> No arquivo deve constar o nome dos ALUNOS que auxiliou na tarefa, independente de ser atividade em grupo. (Descreva o que cada aluno realizou).
> Informar o GITHUB do projeto em uma nova branch.
> Informar todos os prompts utilizados para modificar a aplicação.
> Entregar diagrama de classes e componentes do BACKEND da aplicação em VERTICAL SLICE e CLEAN ARCHITECTURE e SOLID (gerar em markdown e imagem).

## Prompt 2 — respostas às perguntas de esclarecimento da IA

A IA perguntou qual era o código, como publicar a branch e como registrar a participação dos alunos. Respostas dadas:

> - O backend do TDE 2 é o `api/` do repositório cloudlog-pjbl (as 5 Azure Functions + MongoDB): **Sim, é o cloudlog-pjbl.**
> - Como fazer o push da nova branch: **Conectar a pasta do repositório no Mac** (a IA cria a branch, faz commit e push pelo git local).
> - O que cada aluno fez: **Deixar espaço para preencher.**

## O que a IA produziu a partir desses prompts

1. Reorganização de `api/src/` em fatias verticais (`features/<funcionalidade>/`), com camadas da Clean Architecture (`domain/`, use cases, handlers, `infrastructure/`, `bootstrap/`).
2. Aplicação de SOLID: entidade `Delivery` com as regras de validação, portas segregadas (`DeliveryWriter`, `DeliveryReader`, `DeliveryUpdater`, `DeliveryRemover`, `Clock`), repositórios Mongo e em memória intercambiáveis e Composition Root com injeção de dependência.
3. 32 testes automatizados com `node:test`: unitários (domínio, casos de uso, handlers e repositório) e de arquitetura (regras de dependência entre camadas e fatias).
4. Diagramas de classes e de componentes em Mermaid (`docs/backend/*.mmd` e `ARQUITETURA_BACKEND.md`) e em imagem (`docs/backend/img/*.png`).
5. Contrato HTTP preservado: o frontend continua funcionando sem alterações.
