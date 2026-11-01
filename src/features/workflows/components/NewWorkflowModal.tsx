"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { Textarea } from "@/shared/ui/atoms/Textarea";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { Segmented } from "@/shared/ui/molecules/Segmented";
import { templates } from "@/server/seed/demo-workspace";
import { useAuth } from "@/features/auth/store/auth";
import { useUi } from "@/shared/stores/ui";
import { useWorkspace } from "@/features/workflows/store/workspace";

export function NewWorkflowModal() {
  const router = useRouter();
  const open = useUi((state) => state.newWorkflowOpen);
  const setOpen = useUi((state) => state.setNewWorkflowOpen);
  const createWorkflow = useWorkspace((state) => state.createWorkflow);
  const logActivity = useWorkspace((state) => state.logActivity);
  const user = useAuth((state) => state.user);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"blank" | "template">("blank");
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [error, setError] = useState<string>();

  const close = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setMode("blank");
    setError(undefined);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Bu alan zorunlu");
      return;
    }
    const id = createWorkflow({
      name: name.trim(),
      description: description.trim(),
      templateId: mode === "template" ? templateId : undefined,
    });
    if (user) logActivity(user.name, "oluşturdu", name.trim());
    close();
    router.push(`/duzenleyici/${id}`);
  };

  return (
    <Modal open={open} onClose={close} title="Yeni Workflow" size="md">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField label="Workflow adı" htmlFor="yeni-ad" required error={error}>
          <Input
            id="yeni-ad"
            autoFocus
            value={name}
            invalid={Boolean(error)}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormField label="Açıklama" htmlFor="yeni-aciklama">
          <Textarea
            id="yeni-aciklama"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
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
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              options={templates.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </FormField>
        )}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={close}>
            İptal
          </Button>
          <Button type="submit">Oluştur</Button>
        </div>
      </form>
    </Modal>
  );
}
