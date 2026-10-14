/** Implementação inicial da porta AlertNotifier: registra o alerta (futuro: push/e-mail/SMS). */
class LogAlertNotifier {
  constructor({ logger = console } = {}) {
    this.logger = logger;
    this.sent = [];
  }

  async notify(alert) {
    this.sent.push(alert);
    this.logger.warn?.(`[Alerta RF-05] ${alert.message}`);
  }
}

module.exports = { LogAlertNotifier };
