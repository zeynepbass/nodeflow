"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@/features/editor/store/editor";
import { Input } from "@/shared/ui/atoms/Input";

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
