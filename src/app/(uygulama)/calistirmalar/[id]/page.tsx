import type { Metadata } from "next";
import { Prefetch } from "@/app/Prefetch";
import { ExecutionsView } from "@/features/executions/components/ExecutionsView";
import { queryKeys } from "@/shared/api/query-keys";

export const metadata: Metadata = { title: "Çalıştırma Detayı" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
      <ExecutionsView selectedId={id} />
    </Prefetch>
  );
}
