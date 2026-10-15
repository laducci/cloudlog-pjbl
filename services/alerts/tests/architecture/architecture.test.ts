/**
 * Testes unitários de ARQUITETURA com ArchUnitTS (archunit).
 * Serviço de Alertas — Clean Architecture + Vertical Slice.
 */
import { metrics, projectFiles, projectSlices } from "archunit";

const SLICES = ["processDeliveryEvent", "listAlerts"];

const importsPackage = (content: string, pkg: string) =>
  new RegExp(`from\\s+["']${pkg.replace("/", "\\/")}(\\/[^"']*)?["']`).test(content);

describe("Clean Architecture — regra de dependência", () => {
  it("as camadas seguem o diagrama permitido", async () => {
    const diagram = `
@startuml
  component [domain]
  component [features]
  component [shared]
  component [infrastructure]
  component [bootstrap]
  [features] --> [domain]
  [features] --> [shared]
  [features] --> [bootstrap]
  [shared] --> [domain]
  [infrastructure] --> [domain]
  [bootstrap] --> [domain]
  [bootstrap] --> [features]
  [bootstrap] --> [infrastructure]
@enduml`;
    await expect(projectSlices().definedBy("src/(**)/").should().adhereToDiagram(diagram)).toPassAsync();
  });

  it("domain não depende de features", async () => {
    await expect(projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/features/**")).toPassAsync();
  });

  it("domain não depende de infrastructure", async () => {
    await expect(projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/infrastructure/**")).toPassAsync();
  });

  it("domain não depende de shared/http nem de bootstrap", async () => {
    await expect(projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/shared/**")).toPassAsync();
    await expect(projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/bootstrap/**")).toPassAsync();
  });

  it("casos de uso não dependem de infraestrutura, HTTP nem bootstrap", async () => {
    for (const folder of ["src/infrastructure/**", "src/shared/**", "src/bootstrap/**"]) {
      await expect(projectFiles().withName("*UseCase.ts").shouldNot().dependOnFiles().inFolder(folder)).toPassAsync();
    }
  });

  it("handlers não dependem da infraestrutura (DIP)", async () => {
    await expect(projectFiles().withName("*.handler.ts").shouldNot().dependOnFiles().inFolder("src/infrastructure/**")).toPassAsync();
  });

  it("infraestrutura aponta só para dentro (não conhece features, shared nem bootstrap)", async () => {
    for (const folder of ["src/features/**", "src/shared/**", "src/bootstrap/**"]) {
      await expect(projectFiles().inFolder("src/infrastructure/**").shouldNot().dependOnFiles().inFolder(folder)).toPassAsync();
    }
  });

  it("não há dependências circulares", async () => {
    await expect(projectFiles().inFolder("src/**").should().haveNoCycles()).toPassAsync();
  });
});

describe("Vertical Slice — isolamento das fatias", () => {
  for (const from of SLICES) {
    it(`a fatia ${from} não depende de outras fatias`, async () => {
      for (const to of SLICES.filter((s) => s !== from)) {
        await expect(projectFiles().inFolder(`src/features/${from}/**`).shouldNot().dependOnFiles().inFolder(`src/features/${to}/**`)).toPassAsync();
      }
    });
  }

  it("toda fatia contém apenas UseCase, handler e function", async () => {
    await expect(projectFiles().inFolder("src/features/**").should().haveName(/^([A-Z]\w+UseCase|\w+\.handler|\w+\.function)\.ts$/)).toPassAsync();
  });

  it("casos de uso só existem dentro de features/", async () => {
    await expect(projectFiles().withName("*UseCase.ts").should().beInFolder("src/features/**")).toPassAsync();
  });
});

describe("Pacotes externos confinados aos adaptadores", () => {
  it("'@azure/functions' só aparece nos arquivos *.function.ts", async () => {
    const rule = projectFiles().inFolder("src/**").should().adhereTo(
      (f) => !importsPackage(f.content, "@azure/functions") || f.name.endsWith(".function"),
      "Somente *.function.ts pode importar @azure/functions");
    await expect(rule).toPassAsync();
  });

  it("'@azure/data-tables' só aparece em infrastructure/persistence/table", async () => {
    const rule = projectFiles().inFolder("src/**").should().adhereTo(
      (f) => !importsPackage(f.content, "@azure/data-tables") || f.path.includes("infrastructure/persistence/table"),
      "Somente o adaptador de Table Storage pode importar @azure/data-tables");
    await expect(rule).toPassAsync();
  });
});

describe("Métricas de código", () => {
  it("nenhum arquivo de src passa de 150 linhas", async () => {
    await expect(metrics().inFolder("src/**").count().linesOfCode().shouldBeBelow(150)).toPassAsync();
  });
});
