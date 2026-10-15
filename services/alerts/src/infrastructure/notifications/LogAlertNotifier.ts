import type { AlertRecord } from "../../domain/alert/Alert";
import type { AlertNotifier } from "../../domain/ports";

/** Implementação inicial da porta AlertNotifier (evolução: push/e-mail/SMS). */
export class LogAlertNotifier implements AlertNotifier {
  readonly sent: AlertRecord[] = [];

  constructor(private readonly logger: Pick<Console, "warn"> = console) {}

  async notify(alert: AlertRecord): Promise<void> {
    this.sent.push(alert);
    this.logger.warn(`[Alerta RF-05] ${alert.message}`);
  }
}
