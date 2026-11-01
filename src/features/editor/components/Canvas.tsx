"use client";

import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  ReactFlow,
  useReactFlow,
  type EdgeChange,
  type NodeChange,
  type NodeMouseHandler,
} from "@xyflow/react";
import { Map as MapIcon, X } from "lucide-react";
import { useCallback, useRef, useState, type DragEvent } from "react";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { categories } from "@/shared/domain/nodes/catalog";
import { useEditor, type FlowEdge, type FlowNode } from "@/features/editor/store/editor";
import {
  FlowConnectionLine,
  FlowEdgeLine,
} from "@/features/editor/components/FlowEdgeLine";
import { FlowNodeCard } from "@/features/editor/components/FlowNodeCard";
import { DRAG_TYPE } from "@/features/editor/components/NodeLibrary";

const nodeTypes = { flow: FlowNodeCard };
const edgeTypes = { flow: FlowEdgeLine };

export function Canvas() {
  const flow = useReactFlow<FlowNode, FlowEdge>();
  const wrapper = useRef<HTMLDivElement>(null);
  const coarse = useMediaQuery("(pointer: coarse)");
  const nodes = useEditor((state) => state.nodes);
  const edges = useEditor((state) => state.edges);
  const setNodes = useEditor((state) => state.setNodes);
  const setEdges = useEditor((state) => state.setEdges);
  const connect = useEditor((state) => state.connect);
  const canConnect = useEditor((state) => state.canConnect);
  const snapshot = useEditor((state) => state.snapshot);
  const commit = useEditor((state) => state.commit);
  const selectNode = useEditor((state) => state.selectNode);
  const setPanelTab = useEditor((state) => state.setPanelTab);
  const addNode = useEditor((state) => state.addNode);
  const [dropBox, setDropBox] = useState<{ x: number; y: number } | null>(null);
  const [minimapOpen, setMinimapOpen] = useState(true);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) =>
      setNodes(applyNodeChanges(changes, useEditor.getState().nodes)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<FlowEdge>[]) =>
      setEdges(applyEdgeChanges(changes, useEditor.getState().edges)),
    [setEdges],
  );

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    const bounds = wrapper.current?.getBoundingClientRect();
    if (bounds) {
      setDropBox({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDropBox(null);
    const catalogId = event.dataTransfer.getData(DRAG_TYPE);
    if (!catalogId) return;
    const position = flow.screenToFlowPosition({
      x: event.clientX - 110,
      y: event.clientY - 32,
    });
    addNode(catalogId, position, { snap: true });
  };

  const onNodeClick = useCallback<NodeMouseHandler<FlowNode>>(
    (_, node) => {
      if (node.data.runStatus === "error") setPanelTab("test");
    },
    [setPanelTab],
  );

  return (
    <div
      ref={wrapper}
      data-testid="canvas"
      className="relative min-w-0 flex-1 bg-base"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDropBox(null);
        }
      }}
    >
      <ReactFlow<FlowNode, FlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={connect}
        isValidConnection={canConnect}
        connectionLineComponent={FlowConnectionLine}
        connectionRadius={28}
        onNodeDragStart={snapshot}
        onNodeDragStop={commit}
        onSelectionDragStart={snapshot}
        onSelectionDragStop={commit}
        onBeforeDelete={async () => {
          snapshot();
          return true;
        }}
        onDelete={commit}
        onNodeClick={onNodeClick}
        onSelectionChange={({ nodes: selected }) =>
          selectNode(selected.length === 1 ? selected[0].id : null)
        }
        minZoom={0.25}
        maxZoom={2}
        onlyRenderVisibleElements
        fitView
        fitViewOptions={{ padding: 0.12, minZoom: 0.5, maxZoom: 1 }}
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode="Shift"
        selectionOnDrag={!coarse}
        panOnDrag={coarse ? true : [1, 2]}
        panOnScroll={!coarse}
        zoomOnScroll={coarse}
        zoomActivationKeyCode={["Meta", "Control"]}
        panActivationKeyCode="Space"
        attributionPosition="bottom-left"
        aria-label="Workflow canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="color-mix(in srgb, var(--border-default) 40%, transparent)"
        />
        {minimapOpen ? (
          <>
            <MiniMap<FlowNode>
              pannable
              zoomable
              onClick={(_, position) =>
                flow.setCenter(position.x, position.y, {
                  zoom: flow.getZoom(),
                  duration: 200,
                })
              }
              position="bottom-right"
              style={{
                width: 160,
                height: 100,
                margin: 16,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-surface)",
              }}
              maskColor="color-mix(in srgb, var(--bg-base) 70%, transparent)"
              nodeColor={(node) => categories[node.data.category].color}
              nodeBorderRadius={8}
            />
            <Panel position="bottom-right" style={{ margin: "0 20px 92px 0" }}>
              <IconButton
                label="Mini haritayı daralt"
                size="sm"
                tooltipSide="left"
                className="size-6"
                onClick={() => setMinimapOpen(false)}
              >
                <X size={14} strokeWidth={1.5} aria-hidden />
              </IconButton>
            </Panel>
          </>
        ) : (
          <Panel position="bottom-right" style={{ margin: 16 }}>
            <IconButton
              label="Mini haritayı aç"
              tooltipSide="left"
              className="border border-line bg-surface"
              onClick={() => setMinimapOpen(true)}
            >
              <MapIcon size={20} strokeWidth={1.5} aria-hidden />
            </IconButton>
          </Panel>
        )}
        {nodes.length === 1 && (
          <Panel position="bottom-right" style={{ margin: "0 192px 16px 0" }}>
            <p className="max-w-52 rounded-md border border-line bg-surface p-3 text-caption text-fg-muted shadow-elevation-1">
              Soldan bir node sürükleyip bağlamaya başla.
            </p>
          </Panel>
        )}
      </ReactFlow>
      {dropBox && (
        <div
          aria-hidden
          style={{ left: dropBox.x - 110, top: dropBox.y - 32 }}
          className="pointer-events-none absolute h-16 w-[220px] rounded-lg border-2 border-dashed border-primary-500 bg-[rgb(109_94_245/0.08)]"
        />
      )}
    </div>
  );
}
