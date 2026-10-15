/** Modelos de leitura que o BFF entrega para a Web (gerente e SAC). */
export interface DeliverySummary {
  id: string;
  code: string;
  customer: string;
  destination: string;
  driver: string;
  status: string;
  eta: string;
  progress: number;
}

export interface AlertSummary {
  id: string;
  deliveryCode: string;
  message: string;
  severity: string;
  occurredAt: string;
}

export interface DashboardKpis {
  total: number;
  byStatus: Record<string, number>;
  onTimeRate: number | null;
  averageProgress: number;
}

export interface DashboardView {
  generatedAt: string;
  kpis: DashboardKpis;
  priorities: DeliverySummary[];
  alerts: AlertSummary[];
  warnings: string[];
}
