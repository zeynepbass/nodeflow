import type { Metadata } from "next";
import { ExecutionsView } from "@/components/organisms/ExecutionsView";

export const metadata: Metadata = { title: "Çalıştırmalar" };

export default function Page() {
  return <ExecutionsView />;
}
