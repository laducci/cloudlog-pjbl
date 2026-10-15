import { DashboardCalculator } from "../../src/domain/dashboard/DashboardCalculator";
import { delivery, sampleDeliveries } from "../support/fakes";

describe("DashboardCalculator (domínio do BFF)", () => {
  it("calcula totais por status, taxa no prazo e progresso médio", () => {
    expect(DashboardCalculator.kpis(sampleDeliveries())).toEqual({
      total: 5,
      byStatus: { Pendente: 1, "Em rota": 1, Atrasada: 1, Entregue: 2 },
      onTimeRate: 67,
      averageProgress: 62,
    });
  });

  it("sem entregas concluídas ou atrasadas a taxa é nula", () => {
    expect(DashboardCalculator.kpis([delivery("CL-9", "Em rota")]).onTimeRate).toBeNull();
    expect(DashboardCalculator.kpis([]).averageProgress).toBe(0);
  });

  it("prioridades: atrasadas primeiro, sem entregues", () => {
    expect(DashboardCalculator.priorities(sampleDeliveries()).map((d) => d.code)).toEqual(["CL-2", "CL-1", "CL-5"]);
  });
});
