import type { Metadata } from "next";
import { ExecutionsView } from "@/components/organisms/ExecutionsView";

export const metadata: Metadata = { title: "Çalıştırma Detayı" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExecutionsView selectedId={id} />;
}
