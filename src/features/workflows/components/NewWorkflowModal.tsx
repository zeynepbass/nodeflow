"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  createWorkflowSchema,
  type CreateWorkflowInput,
} from "@/shared/contracts/workflow";
import { workflowTemplates as templates } from "@/shared/domain/templates";
import { useUi } from "@/shared/stores/ui";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { Textarea } from "@/shared/ui/atoms/Textarea";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { Segmented } from "@/shared/ui/molecules/Segmented";
import { useCreateWorkflow } from "../hooks/useWorkflows";

export function NewWorkflowModal() {
  const router = useRouter();
  const open = useUi((state) => state.newWorkflowOpen);
  const setOpen = useUi((state) => state.setNewWorkflowOpen);
  const create = useCreateWorkflow();
  const [mode, setMode] = useState<"blank" | "template">("blank");
  const form = useForm<CreateWorkflowInput>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: { name: "", description: "", templateId: templates[0].id },
  });
  const { errors } = form.formState;
  const templateId = useWatch({ control: form.control, name: "templateId" });

  const close = () => {
    setOpen(false);
    setMode("blank");
    form.reset();
  };

  return (
    <Modal open={open} onClose={close} title="Yeni Workflow" size="md">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) =>
          create.mutate(
            {
              ...values,
              templateId: mode === "template" ? values.templateId : undefined,
            },
            {
              onSuccess: (workflow) => {
                close();
                router.push(`/duzenleyici/${workflow.id}`);
              },
            },
          ),
        )}
      >
        <FormField
          label="Workflow adı"
          htmlFor="yeni-ad"
          required
          error={errors.name?.message}
        >
          <Input
            id="yeni-ad"
            autoFocus
            invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
        </FormField>
        <FormField label="Açıklama" htmlFor="yeni-aciklama">
          <Textarea id="yeni-aciklama" {...form.register("description")} />
        </FormField>
        <Segmented
          label="Başlangıç biçimi"
          value={mode}
          onChange={setMode}
          className="w-full"
          options={[
            { value: "blank", label: "Boştan Başla" },
            { value: "template", label: "Şablon Seç" },
          ]}
        />
        {mode === "template" && (
          <FormField
            label="Şablon"
            htmlFor="yeni-sablon"
            hint={templates.find((item) => item.id === templateId)?.description}
          >
            <Select
              id="yeni-sablon"
              options={templates.map((item) => ({ value: item.id, label: item.name }))}
              {...form.register("templateId")}
            />
          </FormField>
        )}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={close}>
            İptal
          </Button>
          <Button type="submit" loading={create.isPending}>
            Oluştur
          </Button>
        </div>
      </form>
    </Modal>
  );
}
