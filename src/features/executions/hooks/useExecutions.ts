import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { workflowsApi } from "@/features/workflows/api/workflows-api";
import { queryKeys } from "@/shared/api/query-keys";
import { showToast } from "@/shared/stores/toast";
import { executionsApi } from "../api/executions-api";
import { executeFlow, type ExecutionGateway, type ExecutionHooks } from "../lib/execute";
import type { StoredEdge, StoredNode } from "@/shared/domain/types";

export const executionGateway: ExecutionGateway = {
  start: executionsApi.start,
  finish: executionsApi.finish,
};

export function useExecutions() {
  return useQuery({
    queryKey: queryKeys.executions,
    queryFn: executionsApi.list,
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === "running") ? 1000 : false,
  });
}

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: executionsApi.activities,
  });
}

export function useExecuteFlow() {
  const client = useQueryClient();
  return useCallback(
    async (input: {
      workflowId: string;
      nodes: StoredNode[];
      edges: StoredEdge[];
      trigger: string;
      stepDelay?: number;
      hooks?: ExecutionHooks;
    }) => {
      try {
        return await executeFlow({ gateway: executionGateway, ...input });
      } finally {
        client.invalidateQueries({ queryKey: queryKeys.executions });
        client.invalidateQueries({ queryKey: queryKeys.activities });
        client.invalidateQueries({ queryKey: queryKeys.workflows });
      }
    },
    [client],
  );
}

export function useRerunWorkflow() {
  const execute = useExecuteFlow();
  return useMutation({
    mutationFn: async ({ id, trigger = "Manuel" }: { id: string; trigger?: string }) => {
      const workflow = await workflowsApi.get(id);
      return execute({
        workflowId: id,
        nodes: workflow.nodes,
        edges: workflow.edges,
        trigger,
        stepDelay: 180,
      });
    },
    onSuccess: (result) =>
      showToast({
        variant: result.status === "success" ? "success" : "error",
        message:
          result.status === "success"
            ? `${result.workflowName} başarıyla çalıştı.`
            : `${result.workflowName} hatayla sonlandı.`,
      }),
  });
}
