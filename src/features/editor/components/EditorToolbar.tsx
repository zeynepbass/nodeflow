"use client";

import { useReactFlow, useStore } from "@xyflow/react";
import {
  ArrowLeft,
  ChevronDown,
  LibraryBig,
  Maximize,
  Play,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Divider } from "@/shared/ui/atoms/Divider";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Input } from "@/shared/ui/atoms/Input";
import { Menu } from "@/shared/ui/molecules/Menu";
import { SaveStatusPill } from "@/shared/ui/molecules/StatusPill";
import { useEditor } from "@/features/editor/store/editor";

export function EditableName() {
  const name = useEditor((state) => state.name);
  const setName = useEditor((state) => state.setName);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  useEffect(() => {
    if (editing) return;
    const timer = window.setTimeout(() => setValue(name), 0);
    return () => window.clearTimeout(timer);
  }, [editing, name]);

  if (!editing) {
    return (
      <button
        type="button"
        title="Yeniden adlandır"
        onClick={() => setEditing(true)}
        className="min-w-0 truncate rounded-xs px-1 text-h3 hover:bg-surface-hover"
      >
        {name}
      </button>
    );
  }
  return (
    <Input
      autoFocus
      aria-label="Workflow adı"
      value={value}
      className="h-8 w-52"
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        setName(value.trim());
        setEditing(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setValue(name);
          setEditing(false);
        }
      }}
    />
  );
}

export function EditorToolbar({
  onRun,
  onTestRun,
  onSchedule,
  onToggleLibrary,
  onRetrySave,
}: {
  onRun: () => void;
  onTestRun: () => void;
  onSchedule: () => void;
  onToggleLibrary: () => void;
  onRetrySave: () => void;
}) {
  const flow = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);
  const saveState = useEditor((state) => state.saveState);
  const undo = useEditor((state) => state.undo);
  const redo = useEditor((state) => state.redo);
  const canUndo = useEditor((state) => state.past.length > 0);
  const canRedo = useEditor((state) => state.future.length > 0);
  const running = useEditor((state) => state.running);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
      <Link
        href="/is-akislari"
        className="inline-flex h-10 items-center gap-1 rounded-sm px-2 font-medium text-fg-muted hover:bg-surface-hover hover:text-fg"
      >
        <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
        <span className="hidden xl:inline">Workflow&apos;lar</span>
        <span className="sr-only xl:hidden">Workflow&apos;lar</span>
      </Link>
      <Divider vertical />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <EditableName />
        <SaveStatusPill state={saveState} onRetry={onRetrySave} />
      </div>
      <IconButton
        label="Node kütüphanesi"
        className="lg:hidden"
        onClick={onToggleLibrary}
      >
        <LibraryBig size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <IconButton label="Geri al" disabled={!canUndo} onClick={undo}>
        <Undo2 size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <IconButton label="Yinele" disabled={!canRedo} onClick={redo}>
        <Redo2 size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <Divider vertical />
      <IconButton label="Uzaklaştır" onClick={() => flow.zoomOut({ duration: 150 })}>
        <ZoomOut size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <button
        type="button"
        title="Yakınlaştırmayı sıfırla"
        onClick={() => flow.zoomTo(1, { duration: 150 })}
        className="h-10 w-12 rounded-sm font-mono text-code text-fg-muted hover:bg-surface-hover"
      >
        %{Math.round(zoom * 100)}
      </button>
      <IconButton label="Yakınlaştır" onClick={() => flow.zoomIn({ duration: 150 })}>
        <ZoomIn size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <IconButton
        label="Sığdır"
        onClick={() => flow.fitView({ duration: 200, padding: 0.15, maxZoom: 1 })}
      >
        <Maximize size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <Divider vertical />
      <div className="flex">
        <Button className="rounded-r-none" loading={running} onClick={onRun}>
          <Play size={16} strokeWidth={1.5} aria-hidden />
          Çalıştır
        </Button>
        <Menu
          items={[
            { label: "Test Çalıştırması", onSelect: onTestRun, disabled: running },
            { label: "Zamanla", onSelect: onSchedule },
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              aria-label="Çalıştırma seçenekleri"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={toggle}
              className="inline-flex h-10 w-8 items-center justify-center rounded-r-sm border-l border-white/25 bg-action text-white hover:bg-action-hover"
            >
              <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
            </button>
          )}
        />
      </div>
    </header>
  );
}
