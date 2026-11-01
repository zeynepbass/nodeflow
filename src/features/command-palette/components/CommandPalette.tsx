"use client";

import { Moon, Plus, Search, Sun, Workflow, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { navigation } from "@/widgets/app-shell/navigation";
import { useTheme } from "@/features/theme/store/theme";
import { useUi } from "@/shared/stores/ui";
import { useWorkflows } from "@/features/workflows/hooks/useWorkflows";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  run: () => void;
}

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR");

export default function CommandPalette() {
  const router = useRouter();
  const open = useUi((state) => state.paletteOpen);
  const setOpen = useUi((state) => state.setPaletteOpen);
  const setNewWorkflowOpen = useUi((state) => state.setNewWorkflowOpen);
  const { data: workflows } = useWorkflows(open);
  const setPreference = useTheme((state) => state.setPreference);
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const all: Command[] = [
      {
        id: "yeni",
        label: "Yeni Workflow",
        hint: "Aksiyon",
        icon: Plus,
        run: () => setNewWorkflowOpen(true),
      },
      {
        id: "acik",
        label: "Açık temaya geç",
        hint: "Tema",
        icon: Sun,
        run: () => setPreference("light"),
      },
      {
        id: "koyu",
        label: "Koyu temaya geç",
        hint: "Tema",
        icon: Moon,
        run: () => setPreference("dark"),
      },
      ...navigation.map((item) => ({
        id: item.href,
        label: item.label,
        hint: "Sayfa",
        icon: item.icon,
        run: () => router.push(item.href),
      })),
      ...(workflows ?? []).map((item) => ({
        id: item.id,
        label: item.name,
        hint: "Workflow",
        icon: Workflow,
        run: () => router.push(`/duzenleyici/${item.id}`),
      })),
    ];
    const term = normalize(query.trim());
    return term ? all.filter((item) => normalize(item.label).includes(term)) : all;
  }, [query, router, setNewWorkflowOpen, setPreference, workflows]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  };

  const select = (command?: Command) => {
    if (!command) return;
    close();
    command.run();
  };

  return (
    <dialog
      ref={dialog}
      aria-label="Komut paleti"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      className="modal mt-[12vh] max-w-[560px]"
    >
      {open && (
        <div>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Search size={20} strokeWidth={1.5} aria-hidden className="text-fg-muted" />
            <input
              autoFocus
              value={query}
              placeholder="Sayfa, workflow veya komut ara…"
              aria-label="Komut ara"
              onChange={(event) => {
                setQuery(event.target.value);
                setCursor(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setCursor((value) => Math.min(value + 1, commands.length - 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setCursor((value) => Math.max(value - 1, 0));
                }
                if (event.key === "Enter") select(commands[cursor]);
              }}
              className="h-14 flex-1 bg-transparent text-body-lg outline-none"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {commands.map((command, index) => (
              <li key={command.id}>
                <button
                  type="button"
                  onClick={() => select(command)}
                  onMouseEnter={() => setCursor(index)}
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-sm px-3 text-left",
                    index === cursor && "bg-surface-hover",
                  )}
                >
                  <command.icon
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden
                    className="text-fg-muted"
                  />
                  <span className="flex-1 truncate">{command.label}</span>
                  <span className="text-caption text-fg-muted">{command.hint}</span>
                </button>
              </li>
            ))}
            {commands.length === 0 && (
              <li className="px-3 py-6 text-center text-fg-muted">Sonuç bulunamadı.</li>
            )}
          </ul>
        </div>
      )}
    </dialog>
  );
}
