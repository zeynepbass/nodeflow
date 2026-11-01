"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/cn";
import { useEditor } from "@/lib/stores/editor";
import { NodeSettingsPanel } from "./NodeSettingsPanel";

export function RightPanel({
  overlay,
  collapsed,
  onCollapsedChange,
}: {
  overlay: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const node = useEditor((state) =>
    state.nodes.find((item) => item.id === state.selectedNodeId),
  );

  if (overlay && !node) return null;
  if (collapsed && !overlay) {
    return (
      <aside className="flex w-14 shrink-0 justify-center border-l border-line bg-surface py-2">
        <IconButton
          label="Ayar panelini aç"
          tooltipSide="left"
          onClick={() => onCollapsedChange(false)}
        >
          <PanelRightOpen size={20} strokeWidth={1.5} aria-hidden />
        </IconButton>
      </aside>
    );
  }
  return (
    <aside
      aria-label="Node ayarları"
      className={cn(
        "flex shrink-0 flex-col border-l border-line bg-surface",
        overlay
          ? "absolute inset-y-0 right-0 z-20 w-80 shadow-elevation-4"
          : "w-[280px] xl:w-80",
      )}
    >
      {node ? (
        <NodeSettingsPanel key={node.id} node={node} />
      ) : (
        <>
          <div className="flex justify-end p-2">
            <IconButton
              label="Ayar panelini daralt"
              size="sm"
              tooltipSide="left"
              onClick={() => onCollapsedChange(true)}
            >
              <PanelRightClose size={20} strokeWidth={1.5} aria-hidden />
            </IconButton>
          </div>
          <p className="px-5 py-10 text-center text-fg-muted">
            Ayarlarını görmek için bir node seç.
          </p>
        </>
      )}
    </aside>
  );
}
