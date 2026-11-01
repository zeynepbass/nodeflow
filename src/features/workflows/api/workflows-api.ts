import { http } from "@/shared/api/http-client";
import type {
  CreateWorkflowInput,
  SaveFlowInput,
  UpdateWorkflowInput,
} from "@/shared/contracts/workflow";
import type { Workflow } from "@/shared/domain/types";

export const workflowsApi = {
  list: () => http.get<Workflow[]>("/api/workflows"),
  get: (id: string) => http.get<Workflow>(`/api/workflows/${id}`),
  create: (input: CreateWorkflowInput) => http.post<Workflow>("/api/workflows", input),
  duplicate: (id: string) => http.post<Workflow>(`/api/workflows/${id}/duplicate`),
  update: (id: string, patch: UpdateWorkflowInput) =>
    http.patch<Workflow>(`/api/workflows/${id}`, patch),
  saveFlow: (id: string, flow: SaveFlowInput) =>
    http.put<Workflow>(`/api/workflows/${id}/flow`, flow),
  remove: (ids: string[]) => http.post<void>("/api/workflows/bulk-delete", { ids }),
};
