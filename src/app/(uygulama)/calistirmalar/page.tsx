import type { Metadata } from "next";
import { ExecutionsView } from "@/features/executions/components/ExecutionsView";

export const metadata: Metadata = { title: "Çalıştırmalar" };

export default function Page() {
  return <ExecutionsView />;
}
