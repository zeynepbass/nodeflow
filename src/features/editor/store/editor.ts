import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import { createId } from "@/shared/lib/id";
import { categories, createStoredNode } from "@/shared/domain/nodes/catalog";
import { wouldCreateCycle } from "@/shared/domain/nodes/engine";
import type {
  FlowNodeData,
  StoredEdge,
  StoredNode,
  Workflow,
} from "@/shared/domain/types";

export type FlowNode = Node<FlowNodeData, "flow">;
export type FlowEdge = Edge<Record<string, never>, "flow">;
export type PanelTab = "general" | "params" | "test";
export type SaveState = "saved" | "saving" | "error";

interface Snapshot {
  name: string;
  nodes: StoredNode[];
  edges: StoredEdge[];
}

interface EditorState {
  workflowId: string | null;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  past: Snapshot[];
  future: Snapshot[];
  revision: number;
  saveState: SaveState;
  selectedNodeId: string | null;
  panelTab: PanelTab;
  draftBase: { id: string; data: FlowNodeData } | null;
  activeEdgeId: string | null;
  running: boolean;
  pickerTarget: PickerTarget | null;

  load: (workflow: Workflow) => void;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  connect: (connection: Connection) => void;
  canConnect: (connection: Connection | FlowEdge) => boolean;
  snapshot: () => void;
  commit: () => void;
  setName: (name: string) => void;
  selectNode: (id: string | null) => void;
  clearSelection: () => void;
  setPanelTab: (tab: PanelTab) => void;
  addNode: (
    catalogId: string,
    position: { x: number; y: number },
    options?: { snap?: boolean },
  ) => string;
  insertOnEdge: (edgeId: string, catalogId: string) => void;
  insertAfter: (nodeId: string, handle: string | null, catalogId: string) => void;
  removeEdge: (edgeId: string) => void;
  removeNodes: (ids: string[]) => void;
  duplicateNodes: (ids: string[]) => void;
  toggleDisabled: (id: string) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  applyDraft: () => void;
  cancelDraft: () => void;
  undo: () => void;
  redo: () => void;
  snapshotFlow: () => Snapshot;
  setSaveState: (state: SaveState) => void;
  setPickerTarget: (target: PickerTarget | null) => void;
  setRunState: (patch: Partial<Pick<EditorState, "running" | "activeEdgeId">>) => void;
  setNodeRun: (id: string, patch: Pick<FlowNodeData, "runStatus" | "runError">) => void;
  clearRunStates: () => void;
}

export type PickerTarget =
  | { kind: "edge"; edgeId: string }
  | { kind: "after"; nodeId: string; handle: string | null };

const toFlowNode = (node: StoredNode, selected = false): FlowNode => ({
  id: node.id,
  type: "flow",
  position: node.position,
  data: node.data,
  selected,
  deletable: node.data.category !== "start",
});

const toFlowEdge = (edge: StoredEdge): FlowEdge => ({
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

const capture = (state: EditorState): Snapshot => ({
  name: state.name,
  nodes: state.nodes.map(toStoredNode),
  edges: state.edges.map(toStoredEdge),
});

const pushPast = (state: EditorState) => ({
  past: [...state.past, capture(state)].slice(-50),
  future: [],
});

function snapPosition(position: { x: number; y: number }, nodes: FlowNode[]) {
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

const handleOf = (data: FlowNodeData) => (data.category === "condition" ? "yes" : null);

export const useEditor = create<EditorState>((set, get) => ({
  workflowId: null,
  name: "",
  nodes: [],
  edges: [],
  past: [],
  future: [],
  revision: 0,
  saveState: "saved",
  selectedNodeId: null,
  panelTab: "general",
  draftBase: null,
  activeEdgeId: null,
  running: false,
  pickerTarget: null,

  load: (workflow) =>
    set({
      workflowId: workflow.id,
      name: workflow.name,
      nodes: workflow.nodes.map((node) => toFlowNode(node)),
      edges: workflow.edges.map(toFlowEdge),
      past: [],
      future: [],
      revision: 0,
      saveState: "saved",
      selectedNodeId: null,
      panelTab: "general",
      draftBase: null,
      activeEdgeId: null,
      running: false,
      pickerTarget: null,
    }),

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  canConnect: (connection) => {
    const { nodes, edges } = get();
    const { source, target, sourceHandle } = connection;
    if (!source || !target || source === target) return false;
    const targetNode = nodes.find((node) => node.id === target);
    if (!targetNode || !categories[targetNode.data.category].hasInput) return false;
    const duplicate = edges.some(
      (edge) =>
        edge.source === source &&
        edge.target === target &&
        (edge.sourceHandle ?? null) === (sourceHandle ?? null),
    );
    return !duplicate && !wouldCreateCycle(source, target, edges);
  },

  connect: (connection) => {
    if (!get().canConnect(connection)) return;
    set((state) => ({
      ...pushPast(state),
      edges: [
        ...state.edges,
        {
          id: createId("baglanti"),
          type: "flow",
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
        },
      ],
      revision: state.revision + 1,
    }));
  },

  snapshot: () => set((state) => pushPast(state)),

  commit: () => set((state) => ({ revision: state.revision + 1 })),

  setName: (name) => {
    if (!name.trim() || name === get().name) return;
    set((state) => ({ ...pushPast(state), name, revision: state.revision + 1 }));
  },

  selectNode: (id) => {
    if (get().selectedNodeId === id) return;
    get().applyDraft();
    const node = get().nodes.find((item) => item.id === id);
    set({
      selectedNodeId: id,
      panelTab: node?.data.runStatus === "error" ? "test" : "general",
    });
  },

  clearSelection: () => {
    get().applyDraft();
    set((state) => ({
      selectedNodeId: null,
      nodes: state.nodes.map((node) =>
        node.selected ? { ...node, selected: false } : node,
      ),
    }));
  },

  setPanelTab: (panelTab) => set({ panelTab }),

  addNode: (catalogId, position, options) => {
    get().applyDraft();
    const finalPosition = options?.snap ? snapPosition(position, get().nodes) : position;
    const created = createStoredNode(catalogId, finalPosition);
    set((state) => ({
      ...pushPast(state),
      nodes: [
        ...state.nodes.map((node) => ({ ...node, selected: false })),
        toFlowNode(created, true),
      ],
      selectedNodeId: created.id,
      panelTab: "general",
      revision: state.revision + 1,
    }));
    return created.id;
  },

  insertOnEdge: (edgeId, catalogId) => {
    const { nodes, edges } = get();
    const edge = edges.find((item) => item.id === edgeId);
    const source = nodes.find((node) => node.id === edge?.source);
    const target = nodes.find((node) => node.id === edge?.target);
    if (!edge || !source || !target) return;
    const created = createStoredNode(catalogId, {
      x: (source.position.x + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2 + 40,
    });
    set((state) => ({
      ...pushPast(state),
      nodes: [
        ...state.nodes.map((node) => ({ ...node, selected: false })),
        toFlowNode(created, true),
      ],
      edges: [
        ...state.edges.filter((item) => item.id !== edgeId),
        {
          id: createId("baglanti"),
          type: "flow" as const,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: created.id,
        },
        ...(categories[created.data.category].outputs > 0
          ? [
              {
                id: createId("baglanti"),
                type: "flow" as const,
                source: created.id,
                sourceHandle: handleOf(created.data),
                target: edge.target,
              },
            ]
          : []),
      ],
      selectedNodeId: created.id,
      panelTab: "general",
      revision: state.revision + 1,
    }));
  },

  insertAfter: (nodeId, handle, catalogId) => {
    const { nodes, edges } = get();
    const source = nodes.find((node) => node.id === nodeId);
    if (!source) return;
    const created = createStoredNode(catalogId, {
      x: source.position.x + 280,
      y: source.position.y + (handle === "no" ? 160 : 0),
    });
    const continues = categories[created.data.category].outputs > 0;
    const outgoing = edges.filter(
      (edge) => edge.source === nodeId && (edge.sourceHandle ?? null) === handle,
    );
    set((state) => ({
      ...pushPast(state),
      nodes: [...state.nodes, toFlowNode(created)],
      edges: [
        ...state.edges.filter((edge) => !continues || !outgoing.includes(edge)),
        {
          id: createId("baglanti"),
          type: "flow" as const,
          source: nodeId,
          sourceHandle: handle,
          target: created.id,
        },
        ...(continues
          ? outgoing.map((edge) => ({
              ...edge,
              id: createId("baglanti"),
              source: created.id,
              sourceHandle: handleOf(created.data),
            }))
          : []),
      ],
      revision: state.revision + 1,
    }));
  },

  removeEdge: (edgeId) =>
    set((state) => ({
      ...pushPast(state),
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      revision: state.revision + 1,
    })),

  removeNodes: (ids) => {
    const removable = ids.filter((id) => {
      const node = get().nodes.find((item) => item.id === id);
      return node && node.data.category !== "start";
    });
    if (removable.length === 0) return;
    set((state) => ({
      ...pushPast(state),
      nodes: state.nodes.filter((node) => !removable.includes(node.id)),
      edges: state.edges.filter(
        (edge) => !removable.includes(edge.source) && !removable.includes(edge.target),
      ),
      selectedNodeId: removable.includes(state.selectedNodeId ?? "")
        ? null
        : state.selectedNodeId,
      draftBase: null,
      revision: state.revision + 1,
    }));
  },

  duplicateNodes: (ids) => {
    const sources = get().nodes.filter(
      (node) => ids.includes(node.id) && node.data.category !== "start",
    );
    if (sources.length === 0) return;
    const idMap = new Map(sources.map((node) => [node.id, createId("node")]));
    set((state) => ({
      ...pushPast(state),
      nodes: [
        ...state.nodes.map((node) => ({ ...node, selected: false })),
        ...sources.map((node) =>
          toFlowNode(
            {
              id: idMap.get(node.id)!,
              position: { x: node.position.x + 40, y: node.position.y + 40 },
              data: structuredClone(toStoredNode(node).data),
            },
            true,
          ),
        ),
      ],
      edges: [
        ...state.edges,
        ...state.edges
          .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
          .map((edge) => ({
            ...edge,
            id: createId("baglanti"),
            source: idMap.get(edge.source)!,
            target: idMap.get(edge.target)!,
          })),
      ],
      selectedNodeId: sources.length === 1 ? idMap.get(sources[0].id)! : null,
      revision: state.revision + 1,
    }));
  },

  toggleDisabled: (id) =>
    set((state) => ({
      ...pushPast(state),
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, disabled: !node.data.disabled } }
          : node,
      ),
      revision: state.revision + 1,
    })),

  updateNodeData: (id, patch) =>
    set((state) => {
      const node = state.nodes.find((item) => item.id === id);
      if (!node) return state;
      return {
        draftBase: state.draftBase ?? { id, data: node.data },
        nodes: state.nodes.map((item) =>
          item.id === id
            ? {
                ...item,
                data: {
                  ...item.data,
                  ...patch,
                  runStatus: undefined,
                  runError: undefined,
                },
              }
            : item,
        ),
      };
    }),

  applyDraft: () => {
    const { draftBase } = get();
    if (!draftBase) return;
    set((state) => {
      const before = capture({
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === draftBase.id ? { ...node, data: draftBase.data } : node,
        ),
      });
      return {
        past: [...state.past, before].slice(-50),
        future: [],
        draftBase: null,
        revision: state.revision + 1,
      };
    });
  },

  cancelDraft: () => {
    const { draftBase } = get();
    if (!draftBase) return;
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === draftBase.id ? { ...node, data: draftBase.data } : node,
      ),
      draftBase: null,
    }));
  },

  undo: () => {
    get().applyDraft();
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        future: [capture(state), ...state.future],
        name: previous.name,
        nodes: previous.nodes.map((node) => toFlowNode(node)),
        edges: previous.edges.map(toFlowEdge),
        selectedNodeId: null,
        revision: state.revision + 1,
      };
    });
  },

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        past: [...state.past, capture(state)],
        future: state.future.slice(1),
        name: next.name,
        nodes: next.nodes.map((node) => toFlowNode(node)),
        edges: next.edges.map(toFlowEdge),
        selectedNodeId: null,
        revision: state.revision + 1,
      };
    }),

  snapshotFlow: () => capture(get()),

  setSaveState: (saveState) => set({ saveState }),
  setPickerTarget: (pickerTarget) => set({ pickerTarget }),
  setRunState: (patch) => set(patch),

  setNodeRun: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
      ),
    })),

  clearRunStates: () =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.data.runStatus
          ? {
              ...node,
              data: { ...node.data, runStatus: undefined, runError: undefined },
            }
          : node,
      ),
    })),
}));
