import type {
  ConditionRule,
  FlowNodeData,
  StoredEdge,
  StoredNode,
} from "@/shared/domain/types";
import { categories } from "@/shared/domain/nodes/catalog";
import { validateNode } from "@/shared/domain/nodes/validation";

export const mockInput = {
  trigger: { type: "webhook", email: "ayse@ornek.com", status: 200 },
  data: { amount: 150, currency: "TRY", items: 3 },
};

export interface NodeRun {
  ok: boolean;
  branch?: "yes" | "no";
  log: string;
  error?: string;
  output: unknown;
  durationMs: number;
}

const stripBraces = (value: string) =>
  value.replace(/^\s*\{\{\s*/, "").replace(/\s*\}\}\s*$/, "");

function lookup(path: string) {
  return stripBraces(path)
    .split(".")
    .reduce<unknown>(
      (current, key) =>
        typeof current === "object" && current !== null
          ? (current as Record<string, unknown>)[key]
          : undefined,
      mockInput,
    );
}

function compare(left: unknown, operator: ConditionRule["operator"], right: string) {
  const numeric = Number(right);
  switch (operator) {
    case "equals":
      return String(left) === right;
    case "notEquals":
      return String(left) !== right;
    case "greater":
      return Number(left) > numeric;
    case "less":
      return Number(left) < numeric;
    case "contains":
      return String(left).includes(right);
  }
}

export const conditionLabel = (data: FlowNodeData) => {
  const rule = ((data.params.rules ?? []) as ConditionRule[])[0];
  return rule ? `${data.label}: ${stripBraces(rule.field)}` : data.label;
};

function runCondition(data: FlowNodeData, durationMs: number): NodeRun {
  const rules = (data.params.rules ?? []) as ConditionRule[];
  const results: boolean[] = [];
  for (const rule of rules) {
    const value = lookup(rule.field);
    if (value === undefined) {
      const field = stripBraces(rule.field).split(".").pop();
      const error = `değerlendirilemedi — eksik alan: ${field}`;
      return {
        ok: false,
        error: `"${data.label}" ${error}`,
        log: `Koşul: "${data.label}" ${error}`,
        output: { hata: error },
        durationMs,
      };
    }
    results.push(compare(value, rule.operator, rule.value));
  }
  const passed =
    data.params.join === "or" ? results.some(Boolean) : results.every(Boolean);
  return {
    ok: true,
    branch: passed ? "yes" : "no",
    log: `Koşul: "${data.label}" → ${passed ? "Evet" : "Hayır"}`,
    output: { sonuc: passed, dal: passed ? "Evet" : "Hayır" },
    durationMs,
  };
}

export function runNode(data: FlowNodeData): NodeRun {
  const durationMs = 40 + Math.floor(Math.random() * 200);
  const meta = categories[data.category];
  const errors = Object.keys(validateNode(data));
  if (errors.length > 0) {
    const error = `"${data.label}" çalıştırılamadı — ayarlarda ${errors.length} eksik veya hatalı alan var`;
    return {
      ok: false,
      error,
      log: `${meta.label}: ${error}`,
      output: { hata: error },
      durationMs,
    };
  }
  if (data.category === "condition") return runCondition(data, durationMs);
  if (data.category === "start") {
    return { ok: true, log: "Başlangıç çalıştırıldı", output: { baslatildi: true }, durationMs };
  }
  if (data.category === "trigger") {
    return {
      ok: true,
      log: `Tetikleyici: ${data.label} alındı (200 OK)`,
      output: mockInput,
      durationMs,
    };
  }
  if (data.category === "end") {
    return {
      ok: true,
      log: `Bitiş: "${data.label}" akışı sonlandırdı`,
      output: { tamamlandi: true },
      durationMs,
    };
  }
  return {
    ok: true,
    log: `${meta.label}: "${data.label}" çalıştırıldı — ${durationMs}ms`,
    output: { durum: "tamamlandı", girdi: mockInput.data },
    durationMs,
  };
}

export function rootNodes(nodes: StoredNode[], edges: StoredEdge[]) {
  const targets = new Set(edges.map((edge) => edge.target));
  return nodes.filter(
    (node) =>
      node.data.category === "start" ||
      (node.data.category === "trigger" &&
        !targets.has(node.id) &&
        edges.some((edge) => edge.source === node.id)),
  );
}

export const nextEdges = (
  node: StoredNode,
  edges: StoredEdge[],
  branch?: "yes" | "no",
) =>
  edges.filter(
    (edge) =>
      edge.source === node.id && (!branch || edge.sourceHandle === branch),
  );

export function wouldCreateCycle(
  source: string,
  target: string,
  edges: StoredEdge[],
) {
  const stack = [target];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === source) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    edges
      .filter((edge) => edge.source === current)
      .forEach((edge) => stack.push(edge.target));
  }
  return false;
}
