import {
  CirclePlay,
  Cpu,
  Database,
  Flag,
  Split,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createId } from "@/lib/id";
import type { FlowNodeData, NodeCategory, NodeParams } from "@/lib/types";

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  hasInput: boolean;
  outputs: number;
}

export const categories: Record<NodeCategory, CategoryMeta> = {
  start: { label: "Başlangıç", icon: CirclePlay, color: "var(--node-start)", hasInput: false, outputs: 1 },
  trigger: { label: "Tetikleyici", icon: Zap, color: "var(--node-trigger)", hasInput: true, outputs: 1 },
  action: { label: "İşlem", icon: Cpu, color: "var(--node-action)", hasInput: true, outputs: 1 },
  condition: { label: "Koşul", icon: Split, color: "var(--node-condition)", hasInput: true, outputs: 2 },
  data: { label: "Veri", icon: Database, color: "var(--node-data)", hasInput: true, outputs: 1 },
  end: { label: "Bitiş", icon: Flag, color: "var(--node-end)", hasInput: true, outputs: 0 },
};

export const categoryOrder: NodeCategory[] = [
  "start",
  "trigger",
  "action",
  "condition",
  "data",
  "end",
];

export type FieldKind = "text" | "number" | "select" | "textarea" | "keyvalue";

export interface FieldDefinition {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  help?: string;
  mono?: boolean;
  format?: "url" | "email" | "cron";
  options?: { value: string; label: string }[];
  showIf?: { key: string; value: string };
}

export interface CatalogItem {
  id: string;
  category: NodeCategory;
  label: string;
  description: string;
  params: NodeParams;
  fields: FieldDefinition[];
}

const triggerFields: FieldDefinition[] = [
  {
    key: "triggerType",
    label: "Tetikleyici tipi",
    kind: "select",
    required: true,
    options: [
      { value: "webhook", label: "Webhook" },
      { value: "schedule", label: "Zamanlayıcı" },
      { value: "manual", label: "Manuel" },
    ],
  },
  {
    key: "path",
    label: "Webhook yolu",
    kind: "text",
    mono: true,
    required: true,
    placeholder: "/siparis-olustu",
    help: "Dış servislerin istek göndereceği adres.",
    showIf: { key: "triggerType", value: "webhook" },
  },
  {
    key: "cron",
    label: "Cron ifadesi",
    kind: "text",
    mono: true,
    required: true,
    format: "cron",
    placeholder: "0 9 * * *",
    help: "Sırasıyla dakika, saat, ayın günü, ay ve haftanın günü.",
    showIf: { key: "triggerType", value: "schedule" },
  },
];

export const catalog: CatalogItem[] = [
  {
    id: "start",
    category: "start",
    label: "Başlangıç",
    description: "Akışın giriş noktası",
    params: {},
    fields: [],
  },
  {
    id: "trigger-webhook",
    category: "trigger",
    label: "Webhook",
    description: "Dış servisten gelen isteği dinler",
    params: { triggerType: "webhook", path: "/yeni-olay", cron: "" },
    fields: triggerFields,
  },
  {
    id: "trigger-schedule",
    category: "trigger",
    label: "Zamanlayıcı",
    description: "Belirlenen zamanda akışı başlatır",
    params: { triggerType: "schedule", path: "", cron: "0 9 * * *" },
    fields: triggerFields,
  },
  {
    id: "trigger-manual",
    category: "trigger",
    label: "Manuel",
    description: "Akışı elle başlatır",
    params: { triggerType: "manual", path: "", cron: "" },
    fields: triggerFields,
  },
  {
    id: "action-transform",
    category: "action",
    label: "Veriyi Dönüştür",
    description: "Gelen veriyi yeni biçime çevirir",
    params: { expression: "{{data.amount}}" },
    fields: [
      {
        key: "expression",
        label: "İfade",
        kind: "textarea",
        mono: true,
        required: true,
        placeholder: "{{data.amount}}",
        help: "Önceki node'ların çıktılarına {{ }} ile erişebilirsin.",
      },
    ],
  },
  {
    id: "action-http",
    category: "action",
    label: "HTTP İsteği",
    description: "Dış servise istek gönderir",
    params: { method: "POST", url: "", headers: [] },
    fields: [
      {
        key: "method",
        label: "Metot",
        kind: "select",
        options: ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({
          value,
          label: value,
        })),
      },
      {
        key: "url",
        label: "Adres",
        kind: "text",
        mono: true,
        required: true,
        format: "url",
        placeholder: "https://api.ornek.com/kayit",
      },
      { key: "headers", label: "Başlıklar", kind: "keyvalue" },
    ],
  },
  {
    id: "action-email",
    category: "action",
    label: "E-posta Gönder",
    description: "Belirlenen alıcıya e-posta yollar",
    params: { to: "", subject: "", body: "" },
    fields: [
      {
        key: "to",
        label: "Alıcı",
        kind: "text",
        required: true,
        format: "email",
        placeholder: "{{trigger.email}}",
      },
      { key: "subject", label: "Konu", kind: "text", required: true },
      { key: "body", label: "İçerik", kind: "textarea" },
    ],
  },
  {
    id: "action-wait",
    category: "action",
    label: "Bekle",
    description: "Akışı belirli bir süre duraklatır",
    params: { seconds: "30" },
    fields: [
      { key: "seconds", label: "Süre (saniye)", kind: "number", required: true },
    ],
  },
  {
    id: "condition-if",
    category: "condition",
    label: "Koşul",
    description: "Akışı Evet ve Hayır dallarına ayırır",
    params: {
      join: "and",
      rules: [
        { id: "kural-1", field: "{{data.amount}}", operator: "greater", value: "100" },
      ],
    },
    fields: [],
  },
  {
    id: "data-read",
    category: "data",
    label: "Veritabanı Oku",
    description: "Kaynaktan kayıtları getirir",
    params: { source: "musteriler", query: "" },
    fields: [
      { key: "source", label: "Kaynak", kind: "text", mono: true, required: true },
      { key: "query", label: "Sorgu", kind: "textarea", mono: true, placeholder: "durum = aktif" },
    ],
  },
  {
    id: "data-write",
    category: "data",
    label: "Veritabanı Yaz",
    description: "Kaynağa yeni kayıt ekler",
    params: { target: "siparisler", values: [] },
    fields: [
      { key: "target", label: "Hedef", kind: "text", mono: true, required: true },
      { key: "values", label: "Alanlar", kind: "keyvalue" },
    ],
  },
  {
    id: "end-finish",
    category: "end",
    label: "Bitiş",
    description: "Akışı sonlandırır",
    params: { message: "" },
    fields: [{ key: "message", label: "Bitiş mesajı", kind: "text" }],
  },
];

export const findCatalogItem = (id: string) =>
  catalog.find((item) => item.id === id);

const cloneParams = (params: NodeParams): NodeParams =>
  JSON.parse(JSON.stringify(params));

export function createNodeData(
  catalogId: string,
  overrides: Partial<FlowNodeData> = {},
): FlowNodeData {
  const item = findCatalogItem(catalogId);
  if (!item) throw new Error(`Bilinmeyen node: ${catalogId}`);
  return {
    catalogId,
    category: item.category,
    label: item.label,
    description: "",
    disabled: false,
    params: cloneParams(item.params),
    ...overrides,
  };
}

export const createStoredNode = (
  catalogId: string,
  position: { x: number; y: number },
  overrides: Partial<FlowNodeData> = {},
) => ({
  id: createId("node"),
  position,
  data: createNodeData(catalogId, overrides),
});
