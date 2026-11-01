import { describe, expect, it } from "vitest";
import { describeCron, isValidCron } from "./cron";

describe("cron", () => {
  it.each(["0 9 * * *", "*/5 * * * *", "0 9 * * 1-5"])("%s geçerlidir", (value) => {
    expect(isValidCron(value)).toBe(true);
  });

  it.each(["", "0 9 * *", "99 9 * * *", "a b c d e"])("%s geçersizdir", (value) => {
    expect(isValidCron(value)).toBe(false);
  });

  it("ifadeyi okunur Türkçeye çevirir", () => {
    expect(describeCron("0 9 * * *")).toBe("Her gün 09:00'da");
    expect(describeCron("*/5 * * * *")).toBe("Her 5 dakikada bir");
    expect(describeCron("0 9 * * 1")).toBe("Her Pazartesi 09:00'da");
  });
});
