# Prompt utilizado para gerar o frontend

## Ferramenta de IAG

Codex, da OpenAI.

## Prompt

> Crie um frontend responsivo em React para o projeto acadêmico CloudLog, uma plataforma SaaS de gestão logística. A aplicação deve ter identidade visual própria, profissional e sóbria, com foco em uma central operacional. Implemente no mínimo duas telas: (1) uma visão operacional com indicadores de entregas em rota, atrasadas e concluídas, representação visual de telemetria e lista de prioridades; (2) uma tela de gestão de entregas com busca, filtro, tabela e formulário para inserir e alterar registros, além de exclusão com confirmação. O frontend deve consumir uma API HTTP de Azure Functions e suportar quatro operações sobre entregas: pesquisar com GET, inserir com POST, alterar com PUT e excluir com DELETE. Durante o desenvolvimento, permita dados mockados para demonstração local, mas mantenha uma configuração que conecte o site publicado à Function App real. Use textos em português, acessibilidade básica, layout responsivo e dados coerentes com logística. Não use um template genérico de dashboard.

## Complementos fornecidos à IAG

- Personas: Carlos (gerente de logística), Marcos (motorista) e Fernanda (SAC).
- Requisitos relacionados: rastreamento, gestão de rotas e entregas, alertas, comprovantes digitais e BI.
- Metas: reduzir atrasos, reduzir custos e digitalizar comprovantes.
- Hospedagem exigida: Azure Static Web Apps.
- Backend: Azure Functions com dados persistidos no MongoDB Atlas.
