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
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Menu } from "@/shared/ui/molecules/Menu";
import type { Workflow } from "@/shared/domain/types";
import { useDuplicateWorkflow, useUpdateWorkflow } from "../hooks/useWorkflows";
import { downloadWorkflows } from "../lib/workflows";

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
  const update = useUpdateWorkflow();
  const duplicate = useDuplicateWorkflow();
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
          onSelect: () => duplicate(workflow.id),
        },
        {
          label: "Dışa Aktar",
          icon: Download,
          onSelect: () => downloadWorkflows([workflow]),
        },
        {
          label: isActive ? "Durdur" : "Aktifleştir",
          icon: isActive ? Pause : Play,
          onSelect: () =>
            update.mutate({
              id: workflow.id,
              patch: { status: isActive ? "stopped" : "active" },
            }),
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
