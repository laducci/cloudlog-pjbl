import type { DashboardKpis, DeliverySummary } from "./models";

export const STATUSES = ["Pendente", "Em rota", "Atrasada", "Entregue"] as const;
const PRIORITY: Record<string, number> = { Atrasada: 0, "Em rota": 1, Pendente: 2, Entregue: 3 };

/** Regras puras de agregação do painel operacional (RF-06). */
export const DashboardCalculator = {
  kpis(deliveries: DeliverySummary[]): DashboardKpis {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
    for (const d of deliveries) byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    const finishedOrLate = byStatus["Entregue"] + byStatus["Atrasada"];
    const averageProgress = deliveries.length
      ? Math.round(deliveries.reduce((sum, d) => sum + (d.progress || 0), 0) / deliveries.length)
      : 0;
    return {
      total: deliveries.length,
      byStatus,
      onTimeRate: finishedOrLate ? Math.round((byStatus["Entregue"] / finishedOrLate) * 100) : null,
      averageProgress,
    };
  },

  priorities(deliveries: DeliverySummary[], limit = 5): DeliverySummary[] {
    return [...deliveries]
      .filter((d) => d.status !== "Entregue")
      .sort((a, b) => (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9) || a.progress - b.progress)
      .slice(0, limit);
  },
};
