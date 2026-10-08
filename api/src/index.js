// Ponto de entrada das Azure Functions (modelo de programação v4).
// Cada fatia vertical registra sua própria função HTTP.
require("./features/hello/hello.function");
require("./features/searchDeliveries/searchDeliveries.function");
require("./features/createDelivery/createDelivery.function");
require("./features/updateDelivery/updateDelivery.function");
require("./features/deleteDelivery/deleteDelivery.function");
