import { describe, expect, it } from "vitest";
import { createNodeData } from "./catalog";
import { runNode, wouldCreateCycle } from "./engine";

const condition = (field: string, value: string) =>
  createNodeData("condition-if", {
    label: "Kontrol",
    params: {
      join: "and",
      rules: [{ id: "k", field, operator: "greater", value }],
    },
  });

describe("runNode", () => {
  it("koşul doğruysa Evet dalını seçer", () => {
    expect(runNode(condition("{{data.amount}}", "100")).branch).toBe("yes");
  });

  it("koşul yanlışsa Hayır dalını seçer", () => {
    expect(runNode(condition("{{data.amount}}", "500")).branch).toBe("no");
  });

  it("eksik alan hataya dönüşür", () => {
    const run = runNode(condition("{{data.total}}", "100"));
    expect(run.ok).toBe(false);
    expect(run.error).toContain("eksik alan: total");
  });

  it("zorunlu alanı boş node çalışmaz", () => {
    expect(runNode(createNodeData("action-http")).ok).toBe(false);
  });
});

describe("wouldCreateCycle", () => {
  const edges = [
    { id: "1", source: "a", target: "b" },
    { id: "2", source: "b", target: "c" },
  ];

  it("döngü oluşturan bağlantıyı yakalar", () => {
    expect(wouldCreateCycle("c", "a", edges)).toBe(true);
  });

  it("ileri bağlantıya izin verir", () => {
    expect(wouldCreateCycle("a", "c", edges)).toBe(false);
  });
});
