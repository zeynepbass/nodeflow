import type { Metadata } from "next";
import { Prefetch } from "@/app/Prefetch";
import { Dashboard } from "@/features/dashboard/components/Dashboard";
import { queryKeys } from "@/shared/api/query-keys";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <Prefetch
      queries={[
        [queryKeys.workflows, ({ services, userId }) => services.workflows.list(userId)],
        [
          queryKeys.executions,
          ({ services, userId }) => services.executions.list(userId),
        ],
        [
          queryKeys.activities,
          ({ services, userId }) => services.activities.recent(userId),
        ],
      ]}
    >
      <Dashboard />
    </Prefetch>
  );
}
