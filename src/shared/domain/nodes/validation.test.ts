import { describe, expect, it } from "vitest";
import { createNodeData } from "./catalog";
import { validateNode } from "./validation";

describe("validateNode", () => {
  it("boş zorunlu alanı bildirir", () => {
    expect(validateNode(createNodeData("action-http")).url).toBe("Bu alan zorunlu");
  });

  it("geçersiz adresi reddeder", () => {
    const data = createNodeData("action-http", {
      params: { method: "GET", url: "adres", headers: [] },
    });
    expect(validateNode(data).url).toContain("Geçerli bir adres değil");
  });

  it("{{ }} ifadelerini biçim denetiminden muaf tutar", () => {
    const data = createNodeData("action-email", {
      params: { to: "{{trigger.email}}", subject: "Konu", body: "" },
    });
    expect(validateNode(data)).toEqual({});
  });

  it("gizli alanları denetlemez", () => {
    expect(validateNode(createNodeData("trigger-manual"))).toEqual({});
  });
});
