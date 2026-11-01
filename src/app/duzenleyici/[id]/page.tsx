import type { Metadata } from "next";
import { Prefetch } from "@/app/Prefetch";
import { EditorScreen } from "@/features/editor/components/EditorScreen";
import { queryKeys } from "@/shared/api/query-keys";

export const metadata: Metadata = { title: "Node Editör" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Prefetch
      queries={[
        [
          queryKeys.workflow(id),
          ({ services, userId }) => services.workflows.get(userId, id),
        ],
      ]}
    >
      <EditorScreen id={id} />
    </Prefetch>
  );
}
