import type { Metadata } from "next";
import { Prefetch } from "@/app/Prefetch";
import { WorkflowsView } from "@/features/workflows/components/WorkflowsView";
import { queryKeys } from "@/shared/api/query-keys";

export const metadata: Metadata = { title: "Workflow'lar" };

export default function Page() {
  return (
    <Prefetch
      queries={[
        [queryKeys.workflows, ({ services, userId }) => services.workflows.list(userId)],
        [
          queryKeys.executions,
          ({ services, userId }) => services.executions.list(userId),
        ],
      ]}
    >
      <WorkflowsView />
    </Prefetch>
  );
}
