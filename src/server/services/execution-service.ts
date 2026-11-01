import { notFound } from "@/server/errors";
import type {
  ActivityRepository,
  ExecutionRepository,
  WorkflowRepository,
} from "@/server/repositories/types";
import type {
  FinishExecutionInput,
  StartExecutionInput,
} from "@/shared/contracts/execution";
import type { Execution } from "@/shared/domain/types";
import { createId } from "@/shared/lib/id";

const newestFirst = <T extends { startedAt: string }>(items: T[]) =>
  items.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export class ExecutionService {
  constructor(
    private readonly executions: ExecutionRepository,
    private readonly workflows: WorkflowRepository,
    private readonly activities: ActivityRepository,
  ) {}

  async list(ownerId: string) {
    return newestFirst(await this.executions.list(ownerId));
  }

  async get(ownerId: string, id: string) {
    const execution = await this.executions.find(ownerId, id);
    if (!execution) throw notFound("Çalıştırma");
    return execution;
  }

  async start(ownerId: string, userName: string, input: StartExecutionInput) {
    const workflow = await this.workflows.find(ownerId, input.workflowId);
    if (!workflow) throw notFound("Workflow");
    const startedAt = new Date().toISOString();
    const execution: Execution = {
      id: createId("calisma"),
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: "running",
      trigger: input.trigger,
      startedAt,
      durationMs: 0,
      nodes: input.nodes,
      logs: [],
    };
    await this.executions.save(ownerId, execution);
    await this.workflows.save(ownerId, { ...workflow, lastRunAt: startedAt });
    await this.activities.save(ownerId, {
      id: createId("aktivite"),
      user: userName,
      action: "çalıştırdı",
      workflowName: workflow.name,
      at: startedAt,
    });
    return execution;
  }

  async finish(ownerId: string, id: string, input: FinishExecutionInput) {
    const execution = await this.get(ownerId, id);
    const finishedAt = new Date();
    const finished: Execution = {
      ...execution,
      ...input,
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - new Date(execution.startedAt).getTime(),
    };
    await this.executions.save(ownerId, finished);
    return finished;
  }
}
