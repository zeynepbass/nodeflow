"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FieldError } from "@/components/molecules/FormField";
import { Segmented } from "@/components/molecules/Segmented";
import { createId } from "@/lib/id";
import { mockInput } from "@/lib/nodes/engine";
import type { ConditionOperator, ConditionRule, FlowNodeData } from "@/lib/types";
import { operators } from "./summary";

const fieldOptions = [
  ...Object.entries(mockInput).flatMap(([group, values]) =>
    Object.keys(values).map((key) => `{{${group}.${key}}}`),
  ),
];

export function ConditionBuilder({
  data,
  errors,
  onChange,
}: {
  data: FlowNodeData;
  errors: Record<string, string>;
  onChange: (params: FlowNodeData["params"]) => void;
}) {
  const rules = (data.params.rules ?? []) as ConditionRule[];
  const join = data.params.join === "or" ? "or" : "and";

  const setRules = (next: ConditionRule[]) =>
    onChange({ ...data.params, rules: next });
  const patchRule = (id: string, patch: Partial<ConditionRule>) =>
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-h3">Eğer</h3>
      {rules.length > 1 && (
        <Segmented
          label="Koşul bağlacı"
          value={join}
          onChange={(value) => onChange({ ...data.params, join: value })}
          options={[
            { value: "and", label: "VE" },
            { value: "or", label: "VEYA" },
          ]}
        />
      )}
      {rules.map((rule) => (
        <div key={rule.id} className="flex flex-col gap-2 rounded-md border border-line p-3">
          <Select
            aria-label="Alan"
            value={rule.field}
            onChange={(event) => patchRule(rule.id, { field: event.target.value })}
            options={[...new Set([...fieldOptions, rule.field])].map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            aria-label="Operatör"
            value={rule.operator}
            onChange={(event) =>
              patchRule(rule.id, { operator: event.target.value as ConditionOperator })
            }
            options={Object.entries(operators).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Değer"
                value={rule.value}
                invalid={Boolean(errors[`${rule.id}-value`])}
                onChange={(event) => patchRule(rule.id, { value: event.target.value })}
              />
              {errors[`${rule.id}-value`] && (
                <FieldError>{errors[`${rule.id}-value`]}</FieldError>
              )}
            </div>
            {rules.length > 1 && (
              <IconButton
                label="Koşulu sil"
                tooltipSide="left"
                onClick={() => setRules(rules.filter((item) => item.id !== rule.id))}
              >
                <Trash2 size={16} strokeWidth={1.5} aria-hidden />
              </IconButton>
            )}
          </div>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          setRules([
            ...rules,
            {
              id: createId("kural"),
              field: fieldOptions[0],
              operator: "equals",
              value: "",
            },
          ])
        }
      >
        <Plus size={16} strokeWidth={1.5} aria-hidden />
        Koşul Ekle
      </Button>
      {rules.map((rule, index) => (
        <p key={rule.id} className="text-caption text-fg-muted">
          {index === 0 ? "Eğer" : join === "and" ? "VE" : "VEYA"}{" "}
          <code className="font-mono text-on-soft-primary">{rule.field}</code>{" "}
          <strong className="font-semibold">{operators[rule.operator].phrase}</strong>{" "}
          <code className="font-mono">{rule.value || "…"}</code>
          {index === rules.length - 1 && " → Evet dalına git."}
        </p>
      ))}
    </div>
  );
}
