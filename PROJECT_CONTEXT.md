# Contexto mestre — CloudLog

Este arquivo é a memória persistente do projeto. Ele reúne o contexto acumulado sobre o produto fictício CloudLog, sua arquitetura de software e sua reutilização na disciplina de Gestão de Programas e Portfólios de TI.

## 1. Origem e propósito

O CloudLog surgiu como sistema fictício para atividades acadêmicas de Engenharia de Software, inicialmente sobre requisitos e depois sobre documentação arquitetural. É uma plataforma tecnológica em nuvem para logística e transporte rodoviário de cargas.

O problema de negócio inclui falta de visibilidade das entregas em tempo real, dificuldade para acompanhar frota e rotas, comunicação deficiente entre central e motoristas, atrasos, comprovantes em papel, pouca capacidade de medir desempenho e ausência de alertas automáticos. A plataforma integra GPS, telemetria e IoT e centraliza:

**Veículos → Motoristas → Rotas → Entregas → Localização → Ocorrências → Comprovantes → Indicadores.**

CloudLog não é apenas um aplicativo de rastreamento, mas uma plataforma de gestão logística com funcionalidades para diferentes perfis.

## 2. Usuários e personas

### Carlos — Gerente de Logística

Administra a operação pela Aplicação Web. Acompanha frota e veículos em tempo real, custos, consumo, entregas, rotas, atrasos, eficiência, dashboards e relatórios. Cria e atribui rotas e entregas.

### Marcos — Motorista de Frota

Usa um Aplicativo Mobile simples e direto. Consulta rotas e entregas atribuídas, atualiza status, informa chegada, registra conclusão, fotografa comprovantes, coleta ou registra assinatura digital e envia evidências. Usabilidade é prioridade.

### Fernanda — Atendente de SAC

Consulta status e localização da entrega, atrasos, situação da rota e ocorrências para responder clientes sem depender de telefonemas ao motorista ou gerente.

## 3. Objetivos de negócio

- Reduzir custos operacionais de transporte em até 15%.
- Reduzir o tempo de atraso nas entregas em 25%.
- Digitalizar 100% dos comprovantes de entrega.

Relações esperadas: rastreamento melhora o controle; alertas reduzem o tempo de reação; otimização de rotas pode reduzir custos; comprovantes digitais reduzem papel e retrabalho; BI melhora decisões gerenciais.

## 4. Requisitos funcionais

- **RF-01 — Autenticação e Controle de Acesso:** login seguro, MFA e RBAC; perfis possuem permissões distintas.
- **RF-02 — Rastreamento em Tempo Real:** localização via GPS, telemetria e dispositivos IoT.
- **RF-03 — Gestão de Ordens, Rotas e Entregas:** criar e editar entregas e rotas, atribuí-las a motoristas e acompanhar a execução.
- **RF-04 — Comprovação Digital de Entrega:** foto, assinatura digital e outras evidências substituem o canhoto em papel.
- **RF-05 — Alertas de Atraso ou Desvio:** detectar veículo fora da rota e entrega atrasada e alertar a central.
- **RF-06 — Dashboard de Desempenho / BI:** tempo de rota, consumo, desempenho e eficiência.

## 5. Arquitetura e C4 Model

O CloudLog tornou-se estudo de caso arquitetural envolvendo requisitos, C4 Model, Structurizr, arc42, Markdown e Mermaid. O nome exato da primeira disciplina de arquitetura não está confirmado e não deve ser inventado.

Os três níveis C4 são aproximações da mesma arquitetura:

- **Level 1 — System Context:** mostra quem usa o CloudLog e os sistemas externos. Pessoas: gerente, motorista e SAC. Sistema principal: CloudLog. Externos: GPS/IoT e, eventualmente, serviço de notificações. GPS/IoT envia telemetria e localização.
- **Level 2 — Containers:** mostra as principais partes internas descritas abaixo.
- **Level 3 — Components:** aprofunda somente o container API/Backend, não todo o sistema novamente.

### Containers

- **Aplicação Web:** interface administrativa usada pelo gerente e SAC.
- **Aplicativo Mobile:** usado pelo motorista para rotas, status e comprovantes.
- **API / Backend:** autenticação, regras de negócio, gestão operacional e comunicação entre interfaces e serviços; Web e Mobile consomem essa API.
- **Serviço de Telemetria:** recebe e processa GPS/IoT, posições e eventos.
- **Serviço de Alertas:** regras de atraso, desvio e ocorrências.
- **Serviço de Relatórios / BI:** consolida indicadores e dashboards.
- **Banco de Dados:** usuários, veículos, motoristas, rotas, entregas, status e metadados.
- **Armazenamento de Arquivos:** separado do banco relacional para imagens, fotos e comprovantes.

### Componentes da API / Backend

- **Autenticação e RBAC** (RF-01): autenticação, MFA e permissões.
- **Rastreamento em Tempo Real** (RF-02): posições recebidas da telemetria.
- **Gestão de Rotas e Entregas** (RF-03): criação, atribuição e acompanhamento.
- **Comprovação Digital** (RF-04): envio, validação e registro de comprovantes.
- **Regras de Atraso e Desvio** (RF-05): analisa posição, rota, horário, prazo e status e pode gerar ocorrência ou alerta.
- **Indicadores e Consultas** (RF-06): fornece dados para dashboards e BI.
- **Camada de Acesso a Dados:** separa regras de negócio dos detalhes de persistência.

### Convenções visuais e Structurizr

As referências do professor seguem estilo Structurizr: pessoas com ícone, elementos internos coloridos conforme a view, sistemas externos cinza, limites de sistema/container, banco em cilindro, aplicação web e mobile com formas próprias, e componentes dentro de fronteira específica.

Foram criados códigos separados em Structurizr DSL para contexto, containers e componentes. Structurizr foi escolhido porque o professor renderizaria o código e a ferramenta representa diretamente Person, Software System, Container, Component, Database, Web Browser e Mobile Device.

## 6. arc42 e Mermaid

Uma atividade posterior pediu as seções 1, 2 e 3 do arc42 em Markdown:

1. **Introdução e Objetivos:** descrição, visão geral, requisitos funcionais, objetivos de qualidade e stakeholders.
2. **Restrições Arquiteturais:** cloud, integração GPS/telemetria, Web e Mobile, MFA, RBAC, armazenamento de arquivos e restrições acadêmicas como Markdown e Mermaid.
3. **Contexto e Escopo:** usuários, GPS, entradas, saídas, interfaces principais e diagramas C4.

O professor pediu Mermaid para os diagramas. A sintaxe nativa `C4Context`, `C4Container` e `C4Component` apresentou erro por depender da versão do renderizador. Os diagramas foram refeitos com `flowchart`, mantendo a lógica C4. Princípio: **C4 é o modelo arquitetural; Mermaid é a linguagem de desenho.**

## 7. Gestão de Programas e Portfólios de TI

Em outra disciplina, o contexto foi ampliado: **CloudLog Technologies** tornou-se uma empresa fictícia de tecnologia, e a plataforma CloudLog, seu principal produto.

- Disciplina: **Gestão de Programas e Portfólios de TI**.
- Professora: **Rosilene Fernandes**.
- Curso: Engenharia de Software, 6º período, turma B, noturno, 80 horas-aula e 4 créditos.
- Temas: conceitos; alinhamento estratégico; gestão de programas; seleção e priorização; riscos; balanceamento; monitoramento e controle.
- RA1: **Avaliar os elementos do portfólio de projetos de TI a partir de critérios de priorização.**
- Indicadores: identificar componentes candidatos, categorizá-los e avaliá-los com notas e pesos.

No RA01/PJBL, os alunos agem como proprietários/gestores de uma empresa de TI e decidem em quais projetos investir; o objetivo não é programar o CloudLog.

## 8. CloudLog Technologies

Campo de atuação: **soluções SaaS para logística e transporte**.

- **Missão:** Transformar operações logísticas por meio de tecnologia confiável, integrada e orientada por dados, reduzindo custos, atrasos e processos manuais.
- **Visão:** Ser, até 2030, uma das principais plataformas brasileiras de tecnologia para gestão logística, reconhecida pela inovação, confiabilidade e eficiência operacional.
- **Valores:** inovação, segurança, confiabilidade, foco no cliente, decisões orientadas por dados, melhoria contínua, colaboração e sustentabilidade.

Missão, visão e valores devem orientar BSC, seleção, categorias e priorização; não são frases decorativas.

## 9. Balanced Scorecard

### Financeira

- **F1 — Aumentar receita recorrente:** ARR, meta +25% em 24 meses; expansão, novos planos e módulos premium.
- **F2 — Reduzir custos operacionais da plataforma:** custo de infraestrutura por veículo ativo, meta de redução de 15%.

### Clientes

- **C1 — Aumentar satisfação:** NPS ≥ 70.
- **C2 — Aumentar retenção:** taxa de renovação ≥ 92%.

### Processos Internos

- **P1 — Aumentar estabilidade:** disponibilidade ≥ 99,9%.
- **P2 — Melhorar telemetria:** latência de atualização de posição ≤ 10 segundos.
- **P3 — Aumentar inteligência operacional:** ≥ 60% das rotas elegíveis otimizadas automaticamente.

### Aprendizado e Crescimento

- **A1 — Desenvolver competências:** 40 horas de treinamento por funcionário/ano.
- **A2 — Cultura de inovação:** quatro experimentos ou protótipos validados por ano.

Causa e efeito: **Aprendizado e Crescimento → Processos Internos → Clientes → Financeiro.**

## 10. Projetos candidatos e categorias

| ID | Projeto | Categoria | Propósito |
|---|---|---|---|
| P01 | SmartRoute AI | Inovação / Estratégico | IA para otimizar rotas usando distância, prazo, capacidade, telemetria e características operacionais. |
| P02 | CloudLog Expansion | Crescimento | Novas transportadoras e segmentos, planos comerciais, onboarding, escalabilidade e expansão da base. |
| P03 | Telemetry Hub 2.0 | Eficiência Operacional | Modernizar GPS/IoT, reduzir latência, aumentar volume e confiabilidade dos dados. |
| P04 | CloudLog Reliability | Manutenção | Estabilidade, observabilidade, monitoramento, redução de incidentes e disponibilidade. |
| P05 | CloudLog Compliance & Security | Regulatório | MFA, RBAC, auditoria, privacidade, proteção de dados e mitigação de riscos. |

O portfólio é balanceado entre inovar, crescer, sustentar, reduzir riscos e ganhar eficiência.

**Categoria** responde “que tipo de investimento é este?”. **Critério** responde “com base em que se decide a prioridade?”. Não confundir.

## 11. Avaliação ponderada e prioridade

Escala: 1 muito baixo; 2 baixo; 3 médio; 4 alto; 5 muito alto. Fórmula: **Pontuação = Σ(nota × peso)**.

| Critério | Peso |
|---|---:|
| Alinhamento Estratégico | 30% |
| Retorno sobre Investimento | 25% |
| Impacto no Cliente/Organização | 20% |
| Redução de Risco/Urgência | 15% |
| Viabilidade Técnica | 10% |
| **Total** | **100%** |

Resultados e ordem recomendada:

1. **Telemetry Hub 2.0 — 4,50:** fundação tecnológica.
2. **SmartRoute AI — 4,50:** inovação e diferenciação competitiva.
3. **CloudLog Reliability — 4,30:** estabilidade para crescimento.
4. **Compliance & Security — 3,95:** risco e governança.
5. **CloudLog Expansion — 3,95:** expansão após maior maturidade de infraestrutura, confiabilidade e segurança.

O empate entre Telemetry Hub e SmartRoute deve ser resolvido pela interdependência: SmartRoute depende de telemetria confiável, portanto Telemetry Hub vem primeiro. A ordem sintetiza **Infraestrutura → Inovação → Confiabilidade → Segurança → Expansão**. Isso expressa prioridade de portfólio, não exige cronograma estritamente sequencial.

A disciplina avalia a capacidade de transformar estratégia em escolhas de investimento diante de capacidade limitada: estratégia, candidatos, contribuições, classificação, critérios, pesos, valor, prioridade e dependências.

Cadeia central de coerência: **Missão → Visão → Valores → BSC → Projetos → Categorias → Avaliação → Prioridade.** O portfólio não cria a estratégia; ele transforma a estratégia em escolhas de investimento.

## 12. Artefatos já produzidos ou previstos

Arquitetura: requisitos, C4 Levels 1–3, Structurizr DSL, documentação Markdown, arc42 seções 1–3 e diagramas Mermaid.

Portfólio: documento DOCX com empresa, missão, visão, valores, BSC, mapa estratégico, projetos, categorias, matriz ponderada, ranking, interdependências e conclusão. A orientação da professora é entregar a atividade em **um documento único em PDF**.

## 13. Equipe e pendência de padronização

- Camilla Uber
- João Davi
- Laura Guillarducci
- Manoel Valerio da Silveira Neto

Há uma inconsistência: o documento original de requisitos usa **“Camilla Augusta”**, enquanto atividades posteriores usam **“Camilla Uber”**. Confirmar o nome correto antes da entrega e padronizar todos os arquivos; não escolher por suposição.

## 14. Evolução do estudo de caso

1. Problema logístico.
2. Sistema CloudLog como solução.
3. Usuários, objetivos e requisitos.
4. Arquitetura C4.
5. Structurizr, Markdown, Mermaid e arc42.
6. CloudLog Technologies como empresa fictícia.
7. Missão, visão e valores.
8. Planejamento com BSC.
9. Projetos candidatos.
10. Categorização.
11. Avaliação ponderada.
12. Priorização considerando pontuação e interdependências.

CloudLog é, portanto, um estudo de caso transversal para requisitos, arquitetura, documentação arquitetural, planejamento estratégico e gestão de portfólios, mantendo coerência entre trabalhos acadêmicos.

## 15. Novas atividades — Azure, frontend e MongoDB

O projeto passou a incluir três entregas acadêmicas relacionadas entre si:

1. **Azure for Students e primeira Azure Function:** cada integrante deve criar/validar individualmente sua conta estudantil com e-mail `@pucpr.edu.br`, concluir o módulo Microsoft Learn, criar uma Function App com o menor consumo possível (preferência Flex Consumption ou Consumption, região East US 2 quando disponível), documentar o endpoint HTTP, parâmetros e resultado, capturar evidências individuais e excluir os recursos exclusivos somente após o envio.
2. **Frontend do PJBL:** o grupo deve manter ao menos duas telas/funcionalidades, usar IAG e registrar o prompt em `Prompt.md`, incluir `GRUPO.md`, consumir ao menos um GET de Azure Functions com dados mockados, publicar o repositório publicamente no GitHub e o frontend no Azure Static Web Apps, registrar URLs no `README.md` e entregar os links no AVA.
3. **MongoDB Atlas e CRUD:** criar banco Atlas e quatro Azure Functions para inserir, pesquisar, alterar e excluir. O frontend anterior deve executar as quatro operações. A entrega inclui evidências do Atlas, das quatro funções e do frontend, além dos nomes do grupo.

Implementação-base criada neste projeto:

- Frontend React/Vite com telas **Visão operacional** e **Entregas**.
- Modo mock local e configuração para trocar para Azure Functions reais.
- Endpoint introdutório `GET /api/hello?name=...`.
- CRUD de entregas: `GET/POST /api/deliveries` e `PUT/DELETE /api/deliveries/{id}`.
- Persistência preparada para MongoDB Atlas via variáveis protegidas.
- Modelos Word e roteiro de evidências em `outputs/` e `docs/`.

Nunca versionar connection strings, senhas, chaves, tokens, `.env.local` ou `api/local.settings.json`. A conta Azure, os cadastros, a publicação, as URLs e as capturas exigem ação/autenticação dos integrantes.
