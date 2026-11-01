import { http } from "@/shared/api/http-client";
import type {
  FinishExecutionInput,
  StartExecutionInput,
} from "@/shared/contracts/execution";
import type { Activity, Execution } from "@/shared/domain/types";

export const executionsApi = {
  list: () => http.get<Execution[]>("/api/executions"),
  start: (input: StartExecutionInput) => http.post<Execution>("/api/executions", input),
  finish: (id: string, input: FinishExecutionInput) =>
    http.patch<Execution>(`/api/executions/${id}`, input),
  activities: () => http.get<Activity[]>("/api/activities"),
};
