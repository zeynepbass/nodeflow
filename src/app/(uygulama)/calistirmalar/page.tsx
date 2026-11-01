import type { Metadata } from "next";
import { Prefetch } from "@/app/Prefetch";
import { ExecutionsView } from "@/features/executions/components/ExecutionsView";
import { queryKeys } from "@/shared/api/query-keys";

export const metadata: Metadata = { title: "Çalıştırmalar" };

export default function Page() {
  return (
    <Prefetch
      queries={[
        [
          queryKeys.executions,
          ({ services, userId }) => services.executions.list(userId),
        ],
        [queryKeys.workflows, ({ services, userId }) => services.workflows.list(userId)],
      ]}
    >
      <ExecutionsView />
    </Prefetch>
  );
}
