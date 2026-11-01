import { z } from "zod";

const nodeResultSchema = z.object({
  nodeId: z.string(),
  label: z.string(),
  category: z.enum(["start", "trigger", "action", "condition", "data", "end"]),
  status: z.enum(["success", "error", "waiting", "running", "skipped"]),
  error: z.string().optional(),
});

const logLineSchema = z.object({
  id: z.string(),
  at: z.string(),
  message: z.string(),
  level: z.enum(["info", "error"]),
  nodeId: z.string().optional(),
});

export const startExecutionSchema = z.object({
  workflowId: z.string().min(1),
  trigger: z.string().min(1),
  nodes: z.array(nodeResultSchema),
});

export const finishExecutionSchema = z.object({
  status: z.enum(["success", "error"]),
  nodes: z.array(nodeResultSchema),
  logs: z.array(logLineSchema),
});

export type StartExecutionInput = z.input<typeof startExecutionSchema>;
export type FinishExecutionInput = z.input<typeof finishExecutionSchema>;
