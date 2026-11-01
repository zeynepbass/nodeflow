import { createId } from "@/lib/id";
import { useWorkspace } from "@/lib/stores/workspace";
import type {
  Execution,
  NodeResult,
  StoredEdge,
  StoredNode,
} from "@/lib/types";
import { nextEdges, rootNodes, runNode, type NodeRun } from "./engine";

interface ExecuteHooks {
  onNodeStart?: (nodeId: string) => void;
  onNodeEnd?: (nodeId: string, run: NodeRun | null) => void;
  onEdge?: (edgeId: string | null) => void;
}

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export async function executeFlow({
  workflowId,
  workflowName,
  nodes,
  edges,
  trigger,
  stepDelay = 450,
  hooks = {},
}: {
  workflowId: string;
  workflowName: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
  trigger: string;
  stepDelay?: number;
  hooks?: ExecuteHooks;
}) {
  const { upsertExecution } = useWorkspace.getState();
  const startedAt = new Date();
  const results: NodeResult[] = nodes.map((node) => ({
    nodeId: node.id,
    label: node.data.label,
    category: node.data.category,
    status: "waiting",
  }));
  const execution: Execution = {
    id: createId("calisma"),
    workflowId,
    workflowName,
    status: "running",
    trigger,
    startedAt: startedAt.toISOString(),
    durationMs: 0,
    nodes: results,
    logs: [],
  };

  const patchNode = (nodeId: string, patch: Partial<NodeResult>) => {
    execution.nodes = execution.nodes.map((item) =>
      item.nodeId === nodeId ? { ...item, ...patch } : item,
    );
  };
  const log = (message: string, level: "info" | "error", nodeId: string) => {
    execution.logs = [
      ...execution.logs,
      { id: createId("log"), at: new Date().toISOString(), message, level, nodeId },
    ];
  };
  const publish = () => upsertExecution({ ...execution });

  publish();
  const queue = [...rootNodes(nodes, edges)];
  const seen = new Set<string>();
  let failed = false;

  while (queue.length > 0 && !failed) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    patchNode(node.id, { status: "running" });
    publish();
    hooks.onNodeStart?.(node.id);
    await wait(stepDelay);

    const enqueue = (branch?: "yes" | "no") => {
      for (const edge of nextEdges(node, edges, branch)) {
        hooks.onEdge?.(edge.id);
        const target = nodes.find((item) => item.id === edge.target);
        if (target) queue.push(target);
      }
    };

    if (node.data.disabled) {
      patchNode(node.id, { status: "skipped" });
      log(`"${node.data.label}" devre dışı olduğu için atlandı`, "info", node.id);
      hooks.onNodeEnd?.(node.id, null);
      publish();
      enqueue();
      continue;
    }

    const run = runNode(node.data);
    if (run.ok) {
      patchNode(node.id, { status: "success" });
      log(run.log, "info", node.id);
      hooks.onNodeEnd?.(node.id, run);
      publish();
      enqueue(run.branch);
    } else {
      failed = true;
      patchNode(node.id, { status: "error", error: run.error });
      log(run.log, "error", node.id);
      hooks.onNodeEnd?.(node.id, run);
    }
  }

  hooks.onEdge?.(null);
  const finishedAt = new Date();
  execution.status = failed ? "error" : "success";
  execution.finishedAt = finishedAt.toISOString();
  execution.durationMs = finishedAt.getTime() - startedAt.getTime();
  publish();
  return execution;
}

export function rerunWorkflow(workflowId: string, trigger = "Manuel") {
  const workflow = useWorkspace
    .getState()
    .workflows.find((item) => item.id === workflowId);
  if (!workflow) return null;
  return executeFlow({
    workflowId: workflow.id,
    workflowName: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges,
    trigger,
    stepDelay: 180,
  });
}
