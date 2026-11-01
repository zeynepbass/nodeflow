"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type ConnectionLineComponentProps,
  type EdgeProps,
} from "@xyflow/react";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { categories } from "@/shared/domain/nodes/catalog";
import { useEditor, type FlowEdge, type FlowNode } from "@/features/editor/store/editor";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function arrow(x: number, y: number) {
  return `M ${x - 8} ${y - 5} L ${x - 1} ${y} L ${x - 8} ${y + 5}`;
}

export function FlowEdgeLine({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps<FlowEdge>) {
  const category = useEditor(
    (state) => state.nodes.find((node) => node.id === source)?.data.category,
  );
  const active = useEditor((state) => state.activeEdgeId === id);
  const removeEdge = useEditor((state) => state.removeEdge);
  const setPickerTarget = useEditor((state) => state.setPickerTarget);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const color = active
    ? "var(--action-primary)"
    : category
      ? categories[category].color
      : "var(--border-default)";
  const emphasized = hovered || selected || active;
  const enter = () => {
    window.clearTimeout(leaveTimer.current);
    setHovered(true);
  };
  const leave = () => {
    leaveTimer.current = window.setTimeout(() => setHovered(false), 140);
  };
  const stroke = {
    stroke: color,
    strokeWidth: emphasized ? 3 : 2,
    strokeOpacity: emphasized ? 1 : 0.7,
  };

  return (
    <>
      <g onMouseEnter={enter} onMouseLeave={leave}>
        <BaseEdge
          id={id}
          path={path}
          className="kenar-iz"
          style={stroke}
          interactionWidth={24}
        />
        <path
          d={arrow(targetX, targetY)}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={stroke}
        />
      </g>
      {active && !reducedMotion() && (
        <circle r="4" fill="var(--accent)">
          <animateMotion dur="0.5s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {(hovered || selected) && (
        <EdgeLabelRenderer>
          <div
            onMouseEnter={enter}
            onMouseLeave={leave}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="nodrag nopan pointer-events-auto absolute flex animate-fade-in gap-1 rounded-sm border border-line bg-surface p-0.5 shadow-elevation-2"
          >
            <button
              type="button"
              aria-label="Araya node ekle"
              onClick={() => setPickerTarget({ kind: "edge", edgeId: id })}
              className="inline-flex size-7 items-center justify-center rounded-xs text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              <Plus size={16} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Bağlantıyı kes"
              onClick={() => removeEdge(id)}
              className="inline-flex size-7 items-center justify-center rounded-xs text-fg-muted hover:bg-soft-error hover:text-on-soft-error"
            >
              <X size={16} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export function FlowConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}: ConnectionLineComponentProps<FlowNode>) {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
  });
  return (
    <path
      d={path}
      fill="none"
      strokeWidth={2}
      strokeDasharray={connectionStatus === "invalid" ? "6 4" : undefined}
      stroke={
        connectionStatus === "invalid" ? "var(--state-error)" : "var(--action-primary)"
      }
    />
  );
}
