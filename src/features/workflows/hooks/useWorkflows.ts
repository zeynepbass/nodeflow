import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import type { UpdateWorkflowInput } from "@/shared/contracts/workflow";
import type { Workflow } from "@/shared/domain/types";
import { showToast } from "@/shared/stores/toast";
import { workflowsApi } from "../api/workflows-api";

export function useWorkflows(enabled = true) {
  return useQuery({
    queryKey: queryKeys.workflows,
    queryFn: workflowsApi.list,
    enabled,
  });
}

export function useWorkflow(id: string | null) {
  return useQuery({
    queryKey: queryKeys.workflow(id ?? ""),
    queryFn: () => workflowsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflow() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: workflowsApi.create,
    onSuccess: (workflow) => {
      client.setQueryData(queryKeys.workflow(workflow.id), workflow);
      client.invalidateQueries({ queryKey: queryKeys.workflows });
      client.invalidateQueries({ queryKey: queryKeys.activities });
    },
  });
}

export function useUpdateWorkflow() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateWorkflowInput }) =>
      workflowsApi.update(id, patch),
    onSuccess: (workflow) => {
      client.setQueryData(queryKeys.workflow(workflow.id), workflow);
      client.setQueryData<Workflow[]>(queryKeys.workflows, (items) =>
        items?.map((item) => (item.id === workflow.id ? workflow : item)),
      );
    },
  });
}

export function useDeleteWorkflows() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: workflowsApi.remove,
    onSuccess: (_result, ids) => {
      ids.forEach((id) => client.removeQueries({ queryKey: queryKeys.workflow(id) }));
      client.setQueryData<Workflow[]>(queryKeys.workflows, (items) =>
        items?.filter((item) => !ids.includes(item.id)),
      );
      client.invalidateQueries({ queryKey: queryKeys.executions });
    },
  });
}

export function useDuplicateWorkflow() {
  const client = useQueryClient();
  const remove = useDeleteWorkflows();
  const duplicate = useMutation({
    mutationFn: workflowsApi.duplicate,
    onSuccess: (copy) => {
      client.setQueryData<Workflow[]>(queryKeys.workflows, (items) =>
        items ? [copy, ...items] : items,
      );
      showToast({
        message: "Workflow kopyalandı.",
        actionLabel: "Geri Al",
        onAction: () => remove.mutate([copy.id]),
      });
    },
  });
  return duplicate.mutate;
}
