import { describeCron } from "@/lib/nodes/cron";
import type { ConditionRule, FlowNodeData } from "@/lib/types";

export const operators = {
  equals: { label: "eşittir", phrase: "eşitse" },
  notEquals: { label: "eşit değildir", phrase: "eşit değilse" },
  greater: { label: "büyüktür", phrase: "büyükse" },
  less: { label: "küçüktür", phrase: "küçükse" },
  contains: { label: "içerir", phrase: "içeriyorsa" },
};

export function nodeSummary(data: FlowNodeData) {
  const params = data.params;
  switch (data.catalogId) {
    case "start":
      return "Akışın giriş noktası";
    case "trigger-webhook":
    case "trigger-schedule":
    case "trigger-manual":
      if (params.triggerType === "webhook") return String(params.path || "Webhook");
      if (params.triggerType === "schedule") {
        return describeCron(String(params.cron)) || "Zamanlayıcı";
      }
      return "Manuel başlatılır";
    case "action-transform":
      return String(params.expression);
    case "action-http":
      return `${params.method} ${params.url || "adres yok"}`;
    case "action-email":
      return String(params.to || "alıcı yok");
    case "action-wait":
      return `${params.seconds} saniye bekler`;
    case "condition-if": {
      const rule = ((params.rules ?? []) as ConditionRule[])[0];
      if (!rule) return "Koşul tanımlı değil";
      return `Eğer ${rule.field} ${operators[rule.operator].phrase} ${rule.value}`;
    }
    case "data-read":
      return `${params.source} okunur`;
    case "data-write":
      return `${params.target} yazılır`;
    default:
      return String(params.message || "Akışı sonlandırır");
  }
}
