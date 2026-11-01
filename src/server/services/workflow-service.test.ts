import { beforeEach, describe, expect, it } from "vitest";
import { MemoryOwnedRepository } from "@/server/repositories/memory/owned-repository";
import type { Activity, Execution, Workflow } from "@/shared/domain/types";
import { ExecutionService } from "./execution-service";
import { WorkflowService } from "./workflow-service";

describe("WorkflowService", () => {
  let workflows: MemoryOwnedRepository<Workflow>;
  let executions: MemoryOwnedRepository<Execution>;
  let service: WorkflowService;
  let runs: ExecutionService;

  beforeEach(() => {
    workflows = new MemoryOwnedRepository();
    executions = new MemoryOwnedRepository();
    const activities = new MemoryOwnedRepository<Activity>();
    service = new WorkflowService(workflows, executions, activities, () => ({
      nodes: [],
      edges: [],
    }));
    runs = new ExecutionService(executions, workflows, activities);
  });

  it("başka kullanıcının workflow'una erişilemez", async () => {
    const created = await service.create("a", "A", { name: "Akış", description: "" });
    await expect(service.get("b", created.id)).rejects.toMatchObject({ status: 404 });
  });

  it("kopya taslak olarak oluşur", async () => {
    const created = await service.create("a", "A", { name: "Akış", description: "" });
    await service.update("a", created.id, { status: "active" });
    const copy = await service.duplicate("a", created.id);
    expect(copy.name).toBe("Akış (Kopya)");
    expect(copy.status).toBe("draft");
  });

  it("silinen workflow'un çalıştırmaları da silinir", async () => {
    const created = await service.create("a", "A", { name: "Akış", description: "" });
    await runs.start("a", "A", { workflowId: created.id, trigger: "Test", nodes: [] });
    await service.remove("a", [created.id]);
    expect(await executions.list("a")).toHaveLength(0);
  });

  it("çalıştırma bitince süre ve durum kaydedilir", async () => {
    const created = await service.create("a", "A", { name: "Akış", description: "" });
    const run = await runs.start("a", "A", {
      workflowId: created.id,
      trigger: "Test",
      nodes: [],
    });
    const finished = await runs.finish("a", run.id, {
      status: "success",
      nodes: [],
      logs: [],
    });
    expect(finished.status).toBe("success");
    expect(finished.finishedAt).toBeDefined();
    expect((await service.get("a", created.id)).lastRunAt).toBe(run.startedAt);
  });
});
