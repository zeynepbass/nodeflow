import type { Edge, Node } from "@xyflow/react";
import { categories } from "@/shared/domain/nodes/catalog";
import type { FlowNodeData, StoredEdge, StoredNode } from "@/shared/domain/types";

export type FlowNode = Node<FlowNodeData, "flow">;
export type FlowEdge = Edge<Record<string, never>, "flow">;

export const toFlowNode = (node: StoredNode, selected = false): FlowNode => ({
  id: node.id,
  type: "flow",
  position: node.position,
  data: node.data,
  selected,
  deletable: node.data.category !== "start",
});

export const toFlowEdge = (edge: StoredEdge): FlowEdge => ({
  id: edge.id,
  type: "flow",
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
});

export const toStoredNode = (node: FlowNode): StoredNode => {
  const data = { ...node.data };
  delete data.runStatus;
  delete data.runError;
  return { id: node.id, position: node.position, data };
};

export const toStoredEdge = (edge: FlowEdge): StoredEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle,
});

export function snapPosition(position: { x: number; y: number }, nodes: FlowNode[]) {
  const candidates = nodes.filter((node) => {
    const outputs = categories[node.data.category].outputs;
    const dx = position.x - node.position.x;
    return outputs > 0 && dx > 120 && dx < 480;
  });
  const nearest = candidates
    .map((node) => ({
      node,
      distance: Math.hypot(position.x - node.position.x, position.y - node.position.y),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (!nearest || Math.abs(position.y - nearest.node.position.y) > 120) {
    return position;
  }
  return { x: position.x, y: nearest.node.position.y };
}
