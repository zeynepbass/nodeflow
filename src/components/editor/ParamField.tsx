"use client";

import { CircleHelp, Plus, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Tooltip } from "@/components/atoms/Tooltip";
import { FieldError, FormField } from "@/components/molecules/FormField";
import { createId } from "@/lib/id";
import type { FieldDefinition } from "@/lib/nodes/catalog";
import { describeCron } from "@/lib/nodes/cron";
import type { KeyValue, ParamValue } from "@/lib/types";

function VariableChips({ text }: { text: string }) {
  const variables = text.match(/\{\{.*?\}\}/g);
  if (!variables) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {variables.map((variable, index) => (
        <code
          key={`${variable}-${index}`}
          className="rounded-xs bg-soft-primary px-1.5 font-mono text-code text-on-soft-primary"
        >
          {variable}
        </code>
      ))}
    </span>
  );
}

function KeyValueEditor({
  id,
  rows,
  errors,
  onChange,
}: {
  id: string;
  rows: KeyValue[];
  errors: Record<string, string>;
  onChange: (rows: KeyValue[]) => void;
}) {
  const patch = (rowId: string, change: Partial<KeyValue>) =>
    onChange(rows.map((row) => (row.id === rowId ? { ...row, ...change } : row)));
  return (
    <div id={id} className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.id}>
          <div className="flex items-center gap-1">
            <Input
              mono
              aria-label="Anahtar"
              placeholder="Anahtar"
              value={row.key}
              invalid={Boolean(errors[`${row.id}-key`])}
              onChange={(event) => patch(row.id, { key: event.target.value })}
            />
            <Input
              mono
              aria-label="Değer"
              placeholder="Değer"
              value={row.value}
              onChange={(event) => patch(row.id, { value: event.target.value })}
            />
            <IconButton
              label="Satırı sil"
              tooltip={false}
              size="sm"
              onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
            >
              <X size={16} strokeWidth={1.5} aria-hidden />
            </IconButton>
          </div>
          {errors[`${row.id}-key`] && <FieldError>{errors[`${row.id}-key`]}</FieldError>}
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          onChange([...rows, { id: createId("satir"), key: "", value: "" }])
        }
      >
        <Plus size={16} strokeWidth={1.5} aria-hidden />
        Satır Ekle
      </Button>
    </div>
  );
}

export function ParamField({
  field,
  value,
  errors,
  onChange,
}: {
  field: FieldDefinition;
  value: ParamValue | undefined;
  errors: Record<string, string>;
  onChange: (value: ParamValue) => void;
}) {
  const id = `alan-${field.key}`;
  const text = typeof value === "string" ? value : "";
  const error = errors[field.key];
  const cronText = field.format === "cron" && !error ? describeCron(text) : "";

  return (
    <FormField
      label={field.label}
      htmlFor={id}
      required={field.required}
      error={error}
      hint={cronText || undefined}
      labelAside={
        field.help && (
          <Tooltip content={field.help} side="bottom">
            <button
              type="button"
              aria-label={`${field.label} hakkında yardım`}
              className="inline-flex size-5 items-center justify-center rounded-full text-fg-muted hover:text-fg"
            >
              <CircleHelp size={14} strokeWidth={1.5} aria-hidden />
            </button>
          </Tooltip>
        )
      }
    >
      {field.kind === "select" && (
        <Select
          id={id}
          value={text}
          options={field.options ?? []}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.kind === "textarea" && (
        <Textarea
          id={id}
          mono={field.mono}
          value={text}
          invalid={Boolean(error)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {(field.kind === "text" || field.kind === "number") && (
        <Input
          id={id}
          mono={field.mono}
          inputMode={field.kind === "number" ? "numeric" : undefined}
          value={text}
          invalid={Boolean(error)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.kind === "keyvalue" && (
        <KeyValueEditor
          id={id}
          rows={(value ?? []) as KeyValue[]}
          errors={errors}
          onChange={onChange}
        />
      )}
      {field.kind !== "keyvalue" && field.kind !== "select" && (
        <VariableChips text={text} />
      )}
    </FormField>
  );
}
