"use client";

import {
  Copy,
  Download,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IconButton } from "@/components/atoms/IconButton";
import { Menu } from "@/components/molecules/Menu";
import { showToast } from "@/lib/stores/toast";
import { useWorkspace } from "@/lib/stores/workspace";
import type { Workflow } from "@/lib/types";
import { downloadWorkflows } from "@/lib/workflows";

export function duplicateWithUndo(id: string) {
  const { duplicateWorkflow, removeWorkflows } = useWorkspace.getState();
  const copyId = duplicateWorkflow(id);
  if (!copyId) return;
  showToast({
    message: "Workflow kopyalandı.",
    actionLabel: "Geri Al",
    onAction: () => removeWorkflows([copyId]),
  });
}

export function WorkflowActions({
  workflow,
  onDelete,
  className,
}: {
  workflow: Workflow;
  onDelete: () => void;
  className?: string;
}) {
  const router = useRouter();
  const setStatus = useWorkspace((state) => state.setStatus);
  const isActive = workflow.status === "active";
  return (
    <Menu
      className={className}
      items={[
        {
          label: "Düzenle",
          icon: Pencil,
          onSelect: () => router.push(`/duzenleyici/${workflow.id}`),
        },
        {
          label: "Kopyala",
          icon: Copy,
          onSelect: () => duplicateWithUndo(workflow.id),
        },
        {
          label: "Dışa Aktar",
          icon: Download,
          onSelect: () => downloadWorkflows([workflow]),
        },
        {
          label: isActive ? "Durdur" : "Aktifleştir",
          icon: isActive ? Pause : Play,
          onSelect: () => setStatus(workflow.id, isActive ? "stopped" : "active"),
        },
        { label: "Sil", icon: Trash2, danger: true, onSelect: onDelete },
      ]}
      trigger={({ open, toggle }) => (
        <IconButton
          label="Workflow aksiyonları"
          tooltip={false}
          size="sm"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          <MoreHorizontal size={16} strokeWidth={1.5} aria-hidden />
        </IconButton>
      )}
    />
  );
}
