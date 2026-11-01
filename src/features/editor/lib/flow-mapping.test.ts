import { describe, expect, it } from "vitest";
import { createStoredNode } from "@/shared/domain/nodes/catalog";
import { snapPosition, toFlowNode, toStoredNode } from "./flow-mapping";

describe("flow-mapping", () => {
  it("Başlangıç node'u silinemez", () => {
    const node = createStoredNode("start", { x: 0, y: 0 });
    expect(toFlowNode(node).deletable).toBe(false);
  });

  it("çalışma durumu kaydedilmez", () => {
    const node = createStoredNode("action-wait", { x: 0, y: 0 });
    const flow = toFlowNode({
      ...node,
      data: { ...node.data, runStatus: "error", runError: "hata" },
    });
    expect(toStoredNode(flow).data).not.toHaveProperty("runStatus");
  });

  it("yakın çıkış portunun hizasına oturur", () => {
    const source = toFlowNode(createStoredNode("action-wait", { x: 0, y: 100 }));
    expect(snapPosition({ x: 300, y: 160 }, [source])).toEqual({ x: 300, y: 100 });
  });

  it("uzak node'a hizalanmaz", () => {
    const source = toFlowNode(createStoredNode("action-wait", { x: 0, y: 100 }));
    expect(snapPosition({ x: 300, y: 500 }, [source])).toEqual({ x: 300, y: 500 });
  });
});
