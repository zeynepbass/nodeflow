import type { Execution, Workflow } from "@/shared/domain/types";

export function successRate(workflowId: string, executions: Execution[]) {
  const finished = executions.filter(
    (item) => item.workflowId === workflowId && item.status !== "running",
  );
  if (finished.length === 0) return null;
  const passed = finished.filter((item) => item.status === "success").length;
  return Math.round((passed / finished.length) * 100);
}

export function downloadWorkflows(workflows: Workflow[]) {
  const payload = workflows.length === 1 ? workflows[0] : workflows;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    workflows.length === 1
      ? `${workflows[0].name.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-")}.json`
      : "nodeflow-workflowlar.json";
  link.click();
  URL.revokeObjectURL(url);
}
