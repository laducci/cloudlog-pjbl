workspace "CloudLog" "C4 Model do CloudLog — níveis 1, 2 e 3 (Camilla Augusta Uber, João Davi, Laura Guillarducci)" {

    model {
        gerente = person "Gerente de Logística" "Carlos. Planeja rotas e entregas, acompanha a frota e os indicadores."
        sac = person "Atendente de SAC" "Fernanda. Consulta status, localização e atrasos para atender clientes."
        motorista = person "Motorista de Frota" "Marcos. Consulta rotas, atualiza entregas e envia comprovantes."

        gps = softwareSystem "Dispositivos GPS / IoT" "Rastreadores embarcados nos veículos." "Externo"
        idp = softwareSystem "Provedor de Identidade" "Microsoft Entra External ID: login, MFA e tokens (RF-01)." "Externo"
        notif = softwareSystem "Serviço de Notificações" "Envio de push, e-mail e SMS." "Externo"

        cloudlog = softwareSystem "CloudLog" "Plataforma cloud de gestão logística: rotas e entregas, rastreamento, comprovação digital, alertas e indicadores." {

            shell = container "Shell Web" "Layout, login, menu e carregamento dos microfrontends. Hoje: SPA React com as telas Operação e Entregas." "React + Vite, Module Federation (host)" "Web,Planejado"
            mfeEntregas = container "MFE Entregas" "Pesquisa, inserção, alteração e exclusão de entregas (RF-03)." "React (remote)" "Web,Planejado"
            mfeOperacao = container "MFE Operação" "Indicadores, alertas e visão operacional (RF-05, RF-06)." "React (remote)" "Web,Planejado"
            mfeRastreio = container "MFE Rastreamento" "Mapa da frota em tempo real (RF-02)." "React (remote)" "Web,Planejado"
            mobile = container "App do Motorista" "Rotas do dia, status e comprovação digital (RF-04)." "React Native" "Mobile,Planejado"

            gateway = container "API Gateway" "Valida JWT, aplica rate limit e CORS e roteia para os BFFs." "Azure API Management" "Planejado"
            bffWeb = container "BFF Web" "Agrega dados para o painel do gerente e do SAC." "Azure Functions (Node.js)" "Planejado"
            bffMobile = container "BFF Mobile" "Payload enxuto e sincronização offline para o motorista." "Azure Functions (Node.js)" "Planejado"

            svcEntregas = container "Serviço de Entregas" "CRUD de rotas e entregas; publica eventos de domínio." "Azure Functions (Node.js) — Clean Architecture + Vertical Slice" "Implementado" {
                fnHttp = component "HTTP Functions" "createDelivery, searchDeliveries, updateDelivery, deleteDelivery, helloCloudLog." "features/*/*.function.js"
                handlers = component "Handlers HTTP" "Leem a requisição, chamam o caso de uso e traduzem erros em status HTTP." "features/*/*.handler.js + shared/http"
                useCases = component "Casos de Uso (fatias verticais)" "Create, Search, Update e Delete Delivery; publicam eventos após persistir." "features/*/*UseCase.js"
                domain = component "Domínio" "Delivery, DeliveryStatus, DeliveryEvents e erros de domínio." "domain/delivery + domain/errors"
                ports = component "Portas" "DeliveryWriter, Reader, Updater, Remover, DeliveryEventPublisher, AlertNotifier, Clock." "domain/ports"
                repo = component "MongoDeliveryRepository" "Implementa as portas de persistência." "infrastructure/persistence/mongo"
                publisher = component "ServiceBusDeliveryEventPublisher" "Implementa DeliveryEventPublisher." "infrastructure/messaging"
                root = component "Composition Root" "Instancia adaptadores e injeta nos casos de uso." "bootstrap/container.js"
            }
            svcTelemetria = container "Serviço de Telemetria" "Ingestão de posições, rastreamento e detecção de desvio (RF-02)." "Azure Functions" "Planejado"
            svcComprovantes = container "Serviço de Comprovantes" "Recebe fotos e assinaturas, gera URLs SAS (RF-04)." "Azure Functions" "Planejado"
            svcAlertas = container "Serviço de Alertas" "Consome eventos e dispara alertas de atraso/desvio (RF-05). Mesmo código api/, implantado separadamente." "Azure Functions (ServiceBusQueueTrigger)" "Implementado"
            svcIndicadores = container "Serviço de Indicadores" "Projeções de leitura para dashboards (RF-06)." "Azure Functions" "Planejado"

            dbEntregas = container "Entregas DB" "Coleção deliveries." "MongoDB Atlas" "Database,Implementado"
            dbTelemetria = container "Telemetria DB" "Posições e eventos de telemetria." "Azure Cosmos DB" "Database,Planejado"
            dbComprovantes = container "Comprovantes Storage" "Fotos e assinaturas." "Azure Blob Storage" "Database,Planejado"
            dbAlertas = container "Alertas DB" "Histórico de alertas." "Azure Table Storage" "Database,Planejado"
            dbIndicadores = container "Indicadores DB" "Modelo analítico." "Azure SQL Database" "Database,Planejado"

            bus = container "Barramento de Eventos" "Fila de eventos de domínio (DeliveryCreated, DeliveryUpdated, DeliveryDeleted...)." "Azure Service Bus" "Queue,Implementado"
            iotHub = container "Ingestão IoT" "Recebe mensagens MQTT dos rastreadores." "Azure IoT Hub" "Queue,Planejado"
        }

        # Nível 1
        gerente -> cloudlog "Gerencia rotas, entregas e indicadores" "HTTPS"
        sac -> cloudlog "Consulta entregas e alertas" "HTTPS"
        motorista -> cloudlog "Atualiza entregas e envia comprovantes" "HTTPS / app mobile"
        gps -> cloudlog "Envia posição e telemetria" "MQTT" "Async"
        cloudlog -> idp "Autentica usuários e valida tokens" "OIDC / OAuth 2.0"
        cloudlog -> notif "Solicita envio de alertas" "HTTPS" "Async"

        # Nível 2
        gerente -> shell "Usa" "HTTPS"
        sac -> shell "Usa" "HTTPS"
        motorista -> mobile "Usa"
        shell -> mfeEntregas "Carrega em tempo de execução" "Module Federation"
        shell -> mfeOperacao "Carrega" "Module Federation"
        shell -> mfeRastreio "Carrega" "Module Federation"
        shell -> idp "Login + MFA" "OIDC"
        mfeEntregas -> gateway "Chama API" "HTTPS/JSON"
        mfeOperacao -> gateway "Chama API" "HTTPS/JSON"
        mfeRastreio -> gateway "Chama API" "HTTPS/JSON"
        mobile -> gateway "Chama API" "HTTPS/JSON"
        gateway -> bffWeb "Roteia /web/*" "HTTPS"
        gateway -> bffMobile "Roteia /mobile/*" "HTTPS"
        bffWeb -> svcEntregas "/api/deliveries" "HTTPS/JSON"
        bffWeb -> svcIndicadores "Consulta KPIs" "HTTPS/JSON"
        bffWeb -> svcTelemetria "Posições" "HTTPS/JSON"
        bffMobile -> svcEntregas "Entregas do motorista" "HTTPS/JSON"
        bffMobile -> svcComprovantes "Envia comprovante" "HTTPS"
        svcEntregas -> dbEntregas "Lê/grava (exclusivo)" "MongoDB driver/TLS"
        svcTelemetria -> dbTelemetria "Lê/grava (exclusivo)"
        svcComprovantes -> dbComprovantes "Grava arquivos (exclusivo)"
        svcAlertas -> dbAlertas "Grava alertas (exclusivo)"
        svcIndicadores -> dbIndicadores "Lê/grava (exclusivo)"
        gps -> iotHub "Posições" "MQTT" "Async"
        iotHub -> svcTelemetria "Dispara ingestão" "Event Hubs" "Async"
        svcEntregas -> bus "Publica eventos" "AMQP" "Async"
        svcTelemetria -> bus "Publica PositionReceived / RouteDeviation" "AMQP" "Async"
        svcComprovantes -> bus "Publica ProofSubmitted" "AMQP" "Async"
        bus -> svcAlertas "Entrega eventos" "ServiceBusQueueTrigger" "Async"
        bus -> svcIndicadores "Entrega eventos" "Subscription" "Async"
        svcAlertas -> notif "Envia alerta" "HTTPS"

        # Nível 3 — Serviço de Entregas
        bffWeb -> fnHttp "Chama" "HTTPS/JSON"
        fnHttp -> handlers "Delega"
        fnHttp -> root "Obtém casos de uso"
        handlers -> useCases "Executa"
        useCases -> domain "Usa regras"
        useCases -> ports "Depende de (abstrações)"
        repo -> ports "Implementa"
        publisher -> ports "Implementa"
        root -> repo "Instancia"
        root -> publisher "Instancia"
        repo -> dbEntregas "Lê/grava" "MongoDB driver/TLS"
        publisher -> bus "Publica eventos" "AMQP" "Async"
    }

    views {
        systemContext cloudlog "Nivel1-Contexto" "C4 Nível 1 — Contexto do Sistema" {
            include *
            autoLayout tb
        }
        container cloudlog "Nivel2-Conteineres" "C4 Nível 2 — Contêineres" {
            include *
            autoLayout tb
        }
        component svcEntregas "Nivel3-Componentes" "C4 Nível 3 — Componentes do Serviço de Entregas" {
            include *
            autoLayout tb
        }

        styles {
            element "Person" {
                shape Person
                background #08427B
                color #FFFFFF
            }
            element "Software System" {
                background #1168BD
                color #FFFFFF
            }
            element "Externo" {
                background #999999
                color #FFFFFF
            }
            element "Container" {
                background #438DD5
                color #FFFFFF
            }
            element "Component" {
                background #85BBF0
                color #000000
            }
            element "Planejado" {
                background #B7D3F2
                color #0B2545
                stroke #5B8AC4
            }
            element "Database" {
                shape Cylinder
            }
            element "Queue" {
                shape Pipe
            }
            element "Web" {
                shape WebBrowser
            }
            element "Mobile" {
                shape MobileDevicePortrait
            }
            relationship "Async" {
                dashed true
                color #7A3E9D
            }
        }
    }
}
