import { createStoredNode } from "@/shared/domain/nodes/catalog";
import { createId } from "@/shared/lib/id";
import type {
  Activity,
  Execution,
  FlowNodeData,
  StoredEdge,
  StoredNode,
  Workflow,
} from "@/shared/domain/types";

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60000).toISOString();

const edge = (
  source: StoredNode,
  target: StoredNode,
  sourceHandle?: string,
): StoredEdge => ({
  id: createId("baglanti"),
  source: source.id,
  target: target.id,
  sourceHandle,
});

const node = (
  catalogId: string,
  x: number,
  y: number,
  overrides: Partial<FlowNodeData> = {},
) => createStoredNode(catalogId, { x, y }, overrides);

export function createStartNode() {
  return node("start", 80, 240);
}

function orderFlow(amountField: string) {
  const start = node("start", 0, 160);
  const webhook = node("trigger-webhook", 270, 160, {
    label: "Sipariş Webhook",
    params: { triggerType: "webhook", path: "/siparis-olustu", cron: "" },
  });
  const check = node("condition-if", 540, 160, {
    label: "Tutar > 100",
    params: {
      join: "and",
      rules: [{ id: "kural-1", field: amountField, operator: "greater", value: "100" }],
    },
  });
  const mail = node("action-email", 840, 40, {
    label: "Onay E-postası",
    params: { to: "{{trigger.email}}", subject: "Siparişin alındı", body: "" },
  });
  const finish = node("end-finish", 1110, 40);
  const skip = node("end-finish", 840, 280, { label: "Küçük Sipariş" });
  return {
    nodes: [start, webhook, check, mail, finish, skip],
    edges: [
      edge(start, webhook),
      edge(webhook, check),
      edge(check, mail, "yes"),
      edge(mail, finish),
      edge(check, skip, "no"),
    ],
  };
}

function reportFlow() {
  const start = node("start", 40, 180);
  const timer = node("trigger-schedule", 320, 180, { label: "Her Sabah" });
  const read = node("data-read", 600, 180, { label: "Satışları Oku" });
  const mail = node("action-email", 880, 180, {
    label: "Raporu Gönder",
    params: { to: "ekip@ornek.com", subject: "Günlük satış raporu", body: "" },
  });
  const finish = node("end-finish", 1160, 180);
  return {
    nodes: [start, timer, read, mail, finish],
    edges: [edge(start, timer), edge(timer, read), edge(read, mail), edge(mail, finish)],
  };
}

function syncFlow() {
  const start = node("start", 40, 180);
  const http = node("action-http", 320, 180, { label: "CRM'den Çek" });
  return { nodes: [start, http], edges: [edge(start, http)] };
}

export const templates = [
  {
    id: "siparis",
    name: "Sipariş bildirimi",
    description: "Webhook ile gelen siparişi koşula göre işler.",
    build: () => orderFlow("{{data.amount}}"),
  },
  {
    id: "rapor",
    name: "Günlük rapor",
    description: "Veriyi her sabah okuyup e-postayla gönderir.",
    build: reportFlow,
  },
];

function workflow(
  name: string,
  description: string,
  status: Workflow["status"],
  tags: string[],
  flow: { nodes: StoredNode[]; edges: StoredEdge[] },
  edited: number,
  lastRun?: number,
): Workflow {
  return {
    id: createId("akis"),
    name,
    description,
    status,
    tags,
    createdAt: ago(edited + 20000),
    updatedAt: ago(edited),
    lastRunAt: lastRun === undefined ? undefined : ago(lastRun),
    ...flow,
  };
}

function execution(
  item: Workflow,
  status: "success" | "error",
  minutesAgo: number,
  durationMs: number,
  trigger: string,
): Execution {
  const startedAt = ago(minutesAgo);
  const failAt =
    status === "error"
      ? item.nodes.findIndex((current) => current.data.category === "condition")
      : -1;
  const ran = status === "error" ? item.nodes.slice(0, failAt + 1) : item.nodes;
  const error = "değerlendirilemedi — eksik alan: amount";
  return {
    id: createId("calisma"),
    workflowId: item.id,
    workflowName: item.name,
    status,
    trigger,
    startedAt,
    finishedAt: new Date(new Date(startedAt).getTime() + durationMs).toISOString(),
    durationMs,
    nodes: item.nodes.map((current, index) => ({
      nodeId: current.id,
      label: current.data.label,
      category: current.data.category,
      status:
        index === failAt
          ? "error"
          : status === "error" && index > failAt
            ? "waiting"
            : "success",
      error: index === failAt ? `"${current.data.label}" ${error}` : undefined,
    })),
    logs: ran.map((current, index) => ({
      id: createId("log"),
      at: new Date(new Date(startedAt).getTime() + index * 240).toISOString(),
      nodeId: current.id,
      level: index === failAt ? "error" : "info",
      message:
        index === failAt
          ? `Koşul: "${current.data.label}" ${error}`
          : `"${current.data.label}" çalıştırıldı — ${60 + index * 31}ms`,
    })),
  };
}

export function createDemoWorkspace() {
  const orders = workflow(
    "Sipariş Bildirimi",
    "Yeni siparişleri kaydeder ve müşteriye onay gönderir.",
    "active",
    ["e-ticaret", "e-posta"],
    orderFlow("{{data.amount}}"),
    42,
    3,
  );
  const report = workflow(
    "Günlük Satış Raporu",
    "Satış verisini her sabah ekibe iletir.",
    "active",
    ["rapor"],
    reportFlow(),
    1440,
    95,
  );
  const refund = workflow(
    "İade Kontrolü",
    "İade tutarını kontrol edip ilgili dala yönlendirir.",
    "stopped",
    ["e-ticaret"],
    orderFlow("{{data.total}}"),
    4320,
    30,
  );
  const crm = workflow(
    "CRM Senkronizasyonu",
    "Müşteri kayıtlarını CRM ile eşitler.",
    "draft",
    ["crm"],
    syncFlow(),
    180,
  );
  const executions: Execution[] = [
    execution(orders, "success", 3, 1240, "Webhook"),
    execution(refund, "error", 30, 870, "Webhook"),
    execution(orders, "success", 58, 1180, "Webhook"),
    execution(report, "success", 95, 2140, "Zamanlayıcı"),
    execution(refund, "error", 180, 910, "Webhook"),
    execution(orders, "success", 240, 1320, "Webhook"),
    execution(report, "success", 1535, 2060, "Zamanlayıcı"),
  ];
  const activities: Activity[] = [
    { id: createId("aktivite"), user: "Ece Yılmaz", action: "düzenledi", workflowName: orders.name, at: ago(42) },
    { id: createId("aktivite"), user: "Mert Demir", action: "çalıştırdı", workflowName: refund.name, at: ago(180) },
    { id: createId("aktivite"), user: "Ece Yılmaz", action: "oluşturdu", workflowName: crm.name, at: ago(190) },
    { id: createId("aktivite"), user: "Mert Demir", action: "yorum ekledi", workflowName: report.name, at: ago(1500) },
  ];
  return { workflows: [orders, report, refund, crm], executions, activities };
}
