import { z } from "zod";
import { isValidCron } from "@/shared/domain/nodes/cron";

const categorySchema = z.enum(["start", "trigger", "action", "condition", "data", "end"]);

const keyValueSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
});

const conditionRuleSchema = z.object({
  id: z.string(),
  field: z.string(),
  operator: z.enum(["equals", "notEquals", "greater", "less", "contains"]),
  value: z.string(),
});

const paramValueSchema = z.union([
  z.string(),
  z.array(z.union([conditionRuleSchema, keyValueSchema])),
]);

const nodeSchema = z.object({
  id: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    catalogId: z.string().min(1),
    category: categorySchema,
    label: z.string(),
    description: z.string(),
    disabled: z.boolean(),
    params: z.record(z.string(), paramValueSchema),
  }),
});

const edgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullish(),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1, "Bu alan zorunlu"),
  description: z.string().trim(),
  templateId: z.string().optional(),
});

export const saveFlowSchema = z.object({
  name: z.string().trim().min(1, "Bu alan zorunlu"),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export const updateWorkflowSchema = z.object({
  status: z.enum(["active", "draft", "stopped"]).optional(),
  schedule: z
    .string()
    .trim()
    .refine(isValidCron, "Geçerli bir ifade değil. Örnek: 0 9 * * *")
    .optional(),
});

export const scheduleFormSchema = z.object({
  schedule: z
    .string()
    .trim()
    .min(1, "Bu alan zorunlu")
    .refine(isValidCron, "Geçerli bir ifade değil. Örnek: 0 9 * * *"),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export type CreateWorkflowInput = z.input<typeof createWorkflowSchema>;
export type SaveFlowInput = z.input<typeof saveFlowSchema>;
export type UpdateWorkflowInput = z.input<typeof updateWorkflowSchema>;
