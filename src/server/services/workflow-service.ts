import { notFound } from "@/server/errors";
import type {
  ActivityRepository,
  ExecutionRepository,
  WorkflowRepository,
} from "@/server/repositories/types";
import type { SaveFlowInput, UpdateWorkflowInput } from "@/shared/contracts/workflow";
import type { StoredEdge, StoredNode, Workflow } from "@/shared/domain/types";
import { createId } from "@/shared/lib/id";

type FlowFactory = (templateId?: string) => {
  nodes: StoredNode[];
  edges: StoredEdge[];
};

export class WorkflowService {
  constructor(
    private readonly workflows: WorkflowRepository,
    private readonly executions: ExecutionRepository,
    private readonly activities: ActivityRepository,
    private readonly createFlow: FlowFactory,
  ) {}

  private async record(ownerId: string, user: string, action: string, name: string) {
    await this.activities.save(ownerId, {
      id: createId("aktivite"),
      user,
      action,
      workflowName: name,
      at: new Date().toISOString(),
    });
  }

  list(ownerId: string) {
    return this.workflows.list(ownerId);
  }

  async get(ownerId: string, id: string) {
    const workflow = await this.workflows.find(ownerId, id);
    if (!workflow) throw notFound("Workflow");
    return workflow;
  }

  async create(
    ownerId: string,
    userName: string,
    input: { name: string; description: string; templateId?: string },
  ) {
    const now = new Date().toISOString();
    const workflow: Workflow = {
      id: createId("akis"),
      name: input.name,
      description: input.description,
      status: "draft",
      tags: [],
      createdAt: now,
      updatedAt: now,
      ...this.createFlow(input.templateId),
    };
    await this.workflows.save(ownerId, workflow);
    await this.record(ownerId, userName, "oluşturdu", workflow.name);
    return workflow;
  }

  async duplicate(ownerId: string, id: string) {
    const source = await this.get(ownerId, id);
    const now = new Date().toISOString();
    const copy: Workflow = {
      ...source,
      id: createId("akis"),
      name: `${source.name} (Kopya)`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      lastRunAt: undefined,
    };
    await this.workflows.save(ownerId, copy);
    return copy;
  }

  async saveFlow(ownerId: string, id: string, flow: SaveFlowInput) {
    const workflow = await this.get(ownerId, id);
    const updated: Workflow = {
      ...workflow,
      name: flow.name,
      nodes: flow.nodes as StoredNode[],
      edges: flow.edges,
      updatedAt: new Date().toISOString(),
    };
    await this.workflows.save(ownerId, updated);
    return updated;
  }

  async update(ownerId: string, id: string, patch: UpdateWorkflowInput) {
    const workflow = await this.get(ownerId, id);
    const updated = { ...workflow, ...patch };
    await this.workflows.save(ownerId, updated);
    return updated;
  }

  async remove(ownerId: string, ids: string[]) {
    const related = await this.executions.list(ownerId);
    await this.executions.delete(
      ownerId,
      related.filter((item) => ids.includes(item.workflowId)).map((item) => item.id),
    );
    await this.workflows.delete(ownerId, ids);
  }
}
