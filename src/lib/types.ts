export type NodeCategory =
  | "start"
  | "trigger"
  | "action"
  | "condition"
  | "data"
  | "end";

export interface KeyValue {
  id: string;
  key: string;
  value: string;
}

export interface ConditionRule {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "greater"
  | "less"
  | "contains";

export type ParamValue = string | KeyValue[] | ConditionRule[];
export type NodeParams = Record<string, ParamValue>;

export type RunStatus = "running" | "success" | "error";

export type FlowNodeData = {
  catalogId: string;
  category: NodeCategory;
  label: string;
  description: string;
  disabled: boolean;
  params: NodeParams;
  runStatus?: RunStatus;
  runError?: string;
  dimmed?: boolean;
};

export interface StoredNode {
  id: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface StoredEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

export type WorkflowStatus = "active" | "draft" | "stopped";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  schedule?: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
}

export type ExecutionStatus = "success" | "error" | "running" | "waiting";

export interface NodeResult {
  nodeId: string;
  label: string;
  category: NodeCategory;
  status: "success" | "error" | "waiting" | "running" | "skipped";
  error?: string;
}

export interface LogLine {
  id: string;
  at: string;
  message: string;
  level: "info" | "error";
  nodeId?: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  trigger: string;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  nodes: NodeResult[];
  logs: LogLine[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  workflowName: string;
  at: string;
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  timezone: string;
}
