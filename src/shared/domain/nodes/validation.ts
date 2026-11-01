import type { ConditionRule, FlowNodeData, KeyValue } from "@/shared/domain/types";
import { findCatalogItem, type FieldDefinition } from "@/shared/domain/nodes/catalog";
import { isValidCron } from "@/shared/domain/nodes/cron";

const isExpression = (value: string) => /\{\{.+\}\}/.test(value);

function validateField(field: FieldDefinition, value: string) {
  const text = value.trim();
  if (field.required && !text) return "Bu alan zorunlu";
  if (!text || isExpression(text)) return undefined;
  if (field.kind === "number" && Number.isNaN(Number(text))) {
    return "Geçerli bir sayı gir.";
  }
  if (field.format === "cron" && !isValidCron(text)) {
    return "Geçerli bir ifade değil. Örnek: 0 9 * * *";
  }
  if (field.format === "url" && !URL.canParse(text)) {
    return "Geçerli bir adres değil. Örnek: https://api.ornek.com";
  }
  if (field.format === "email" && !/^\S+@\S+\.\S+$/.test(text)) {
    return "Geçerli bir e-posta adresi değil.";
  }
  return undefined;
}

export const isFieldVisible = (field: FieldDefinition, data: FlowNodeData) =>
  !field.showIf || data.params[field.showIf.key] === field.showIf.value;

export function validateNode(data: FlowNodeData) {
  const errors: Record<string, string> = {};
  if (!data.label.trim()) errors.label = "Bu alan zorunlu";
  const item = findCatalogItem(data.catalogId);
  for (const field of item?.fields ?? []) {
    if (field.kind === "keyvalue" || !isFieldVisible(field, data)) continue;
    const error = validateField(field, String(data.params[field.key] ?? ""));
    if (error) errors[field.key] = error;
  }
  if (data.category === "condition") {
    for (const rule of (data.params.rules ?? []) as ConditionRule[]) {
      if (!rule.field.trim()) errors[`${rule.id}-field`] = "Bu alan zorunlu";
      if (!rule.value.trim()) errors[`${rule.id}-value`] = "Bu alan zorunlu";
    }
  }
  for (const field of item?.fields ?? []) {
    if (field.kind !== "keyvalue") continue;
    const rows = (data.params[field.key] ?? []) as KeyValue[];
    rows.forEach((row) => {
      if (row.value.trim() && !row.key.trim()) {
        errors[`${row.id}-key`] = "Bu alan zorunlu";
      }
    });
  }
  return errors;
}

export const hasErrors = (data: FlowNodeData) =>
  Object.keys(validateNode(data)).length > 0;
