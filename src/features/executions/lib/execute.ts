import type {
  FinishExecutionInput,
  StartExecutionInput,
} from "@/shared/contracts/execution";
import {
  nextEdges,
  rootNodes,
  runNode,
  type NodeRun,
} from "@/shared/domain/nodes/engine";
import type {
  Execution,
  LogLine,
  NodeResult,
  StoredEdge,
  StoredNode,
} from "@/shared/domain/types";
import { createId } from "@/shared/lib/id";

export interface ExecutionGateway {
  start(input: StartExecutionInput): Promise<Execution>;
  finish(id: string, input: FinishExecutionInput): Promise<Execution>;
}

export interface ExecutionHooks {
  onNodeStart?: (nodeId: string) => void;
  onNodeEnd?: (nodeId: string, run: NodeRun | null) => void;
  onEdge?: (edgeId: string | null) => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeFlow({
  gateway,
  workflowId,
  nodes,
  edges,
  trigger,
  stepDelay = 450,
  hooks = {},
}: {
  gateway: ExecutionGateway;
  workflowId: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
  trigger: string;
  stepDelay?: number;
  hooks?: ExecutionHooks;
}) {
  let results: NodeResult[] = nodes.map((node) => ({
    nodeId: node.id,
    label: node.data.label,
    category: node.data.category,
    status: "waiting",
  }));
  const logs: LogLine[] = [];
  const execution = await gateway.start({ workflowId, trigger, nodes: results });

  const patchNode = (nodeId: string, patch: Partial<NodeResult>) => {
    results = results.map((item) =>
      item.nodeId === nodeId ? { ...item, ...patch } : item,
    );
  };
  const log = (message: string, level: LogLine["level"], nodeId: string) => {
    logs.push({
      id: createId("log"),
      at: new Date().toISOString(),
      message,
      level,
      nodeId,
    });
  };

  const queue = [...rootNodes(nodes, edges)];
  const seen = new Set<string>();
  let failed = false;

  while (queue.length > 0 && !failed) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    patchNode(node.id, { status: "running" });
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
      enqueue();
      continue;
    }

    const run = runNode(node.data);
    if (run.ok) {
      patchNode(node.id, { status: "success" });
      log(run.log, "info", node.id);
      hooks.onNodeEnd?.(node.id, run);
      enqueue(run.branch);
    } else {
      failed = true;
      patchNode(node.id, { status: "error", error: run.error });
      log(run.log, "error", node.id);
      hooks.onNodeEnd?.(node.id, run);
    }
  }

  hooks.onEdge?.(null);
  return gateway.finish(execution.id, {
    status: failed ? "error" : "success",
    nodes: results,
    logs,
  });
}
