import type { Metadata } from "next";
import { EditorScreen } from "@/features/editor/components/EditorScreen";

export const metadata: Metadata = { title: "Node Editör" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditorScreen id={id} />;
}
