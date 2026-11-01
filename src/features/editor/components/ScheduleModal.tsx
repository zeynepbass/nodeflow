"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useUpdateWorkflow, useWorkflow } from "@/features/workflows/hooks/useWorkflows";
import { scheduleFormSchema } from "@/shared/contracts/workflow";
import { describeCron } from "@/shared/domain/nodes/cron";
import { showToast } from "@/shared/stores/toast";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { useEditor } from "../store/editor";

export function ScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const workflowId = useEditor((state) => state.workflowId);
  const { data: workflow } = useWorkflow(workflowId);
  const update = useUpdateWorkflow();
  const form = useForm<{ schedule: string }>({
    resolver: zodResolver(scheduleFormSchema),
    values: { schedule: workflow?.schedule ?? "0 9 * * *" },
  });
  const { errors } = form.formState;
  const schedule = useWatch({ control: form.control, name: "schedule" });

  return (
    <Modal open={open} onClose={onClose} title="Zamanla">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) =>
          update.mutate(
            { id: workflowId!, patch: values },
            {
              onSuccess: () => {
                showToast({ message: `Zamanlandı: ${describeCron(values.schedule)}` });
                onClose();
              },
            },
          ),
        )}
      >
        <FormField
          label="Cron ifadesi"
          htmlFor="zamanlama"
          required
          error={errors.schedule?.message}
          hint={describeCron(schedule ?? "") || undefined}
        >
          <Input
            id="zamanlama"
            mono
            invalid={Boolean(errors.schedule)}
            {...form.register("schedule")}
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" loading={update.isPending}>
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
