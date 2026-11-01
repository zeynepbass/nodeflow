"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/molecules/Modal";
import { describeCron, isValidCron } from "@/lib/nodes/cron";
import { useEditor } from "@/lib/stores/editor";
import { showToast } from "@/lib/stores/toast";
import { useWorkspace } from "@/lib/stores/workspace";

export function ScheduleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const workflowId = useEditor((state) => state.workflowId);
  const stored = useWorkspace(
    (state) => state.workflows.find((item) => item.id === workflowId)?.schedule,
  );
  const setSchedule = useWorkspace((state) => state.setSchedule);
  const [draft, setDraft] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const value = draft ?? stored ?? "0 9 * * *";
  const valid = isValidCron(value);

  const close = () => {
    setDraft(null);
    setTouched(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Zamanla"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            İptal
          </Button>
          <Button
            onClick={() => {
              setTouched(true);
              if (!valid || !workflowId) return;
              setSchedule(workflowId, value.trim());
              showToast({ message: `Zamanlandı: ${describeCron(value)}` });
              close();
            }}
          >
            Kaydet
          </Button>
        </>
      }
    >
      <FormField
        label="Cron ifadesi"
        htmlFor="zamanlama"
        required
        error={
          touched && !valid
            ? "Geçerli bir ifade değil. Örnek: 0 9 * * *"
            : undefined
        }
        hint={describeCron(value) || undefined}
      >
        <Input
          id="zamanlama"
          mono
          value={value}
          invalid={touched && !valid}
          onChange={(event) => setDraft(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
