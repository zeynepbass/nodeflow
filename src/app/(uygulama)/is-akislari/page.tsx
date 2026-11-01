import type { Metadata } from "next";
import { WorkflowsView } from "./WorkflowsView";

export const metadata: Metadata = { title: "Workflow'lar" };

export default function Page() {
  return <WorkflowsView />;
}
