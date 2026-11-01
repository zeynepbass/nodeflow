import "server-only";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/shared/domain/demo";
import { MemoryOwnedRepository } from "./repositories/memory/owned-repository";
import { MemoryPreferenceRepository } from "./repositories/memory/preference-repository";
import { MemorySessionRepository } from "./repositories/memory/session-repository";
import { MemoryUserRepository } from "./repositories/memory/user-repository";
import type { Activity, Execution, Workflow } from "@/shared/domain/types";
import {
  createDemoWorkspace,
  createStartNode,
  templateFlows,
} from "./seed/demo-workspace";
import { AccountService } from "./services/account-service";
import { ActivityService } from "./services/activity-service";
import { AuthService } from "./services/auth-service";
import { ExecutionService } from "./services/execution-service";
import { PreferenceService } from "./services/preference-service";
import { ScryptHasher } from "./services/scrypt-hasher";
import { WorkflowService } from "./services/workflow-service";

async function createContainer() {
  const users = new MemoryUserRepository();
  const sessions = new MemorySessionRepository();
  const workflows = new MemoryOwnedRepository<Workflow>();
  const executions = new MemoryOwnedRepository<Execution>();
  const activities = new MemoryOwnedRepository<Activity>();
  const preferences = new MemoryPreferenceRepository();
  const hasher = new ScryptHasher();

  const auth = new AuthService(users, sessions, hasher);
  const services = {
    auth,
    account: new AccountService(auth, workflows, executions, activities, preferences),
    workflows: new WorkflowService(workflows, executions, activities, (templateId) =>
      templateId && templateFlows[templateId]
        ? templateFlows[templateId]()
        : { nodes: [createStartNode()], edges: [] },
    ),
    executions: new ExecutionService(executions, workflows, activities),
    activities: new ActivityService(activities),
    preferences: new PreferenceService(preferences),
  };

  const demoId = "kullanici-demo";
  await users.save({
    id: demoId,
    name: "Deniz Kaya",
    username: "denizkaya",
    email: DEMO_EMAIL,
    timezone: "Europe/Istanbul",
    passwordHash: await hasher.hash(DEMO_PASSWORD),
  });
  await sessions.save({
    id: "oturum-demo-telefon",
    token: "kullanilmayan-ornek-oturum",
    userId: demoId,
    device: "iPhone · Safari",
    location: "Ankara",
    createdAt: new Date().toISOString(),
  });
  const demo = createDemoWorkspace();
  await Promise.all([
    ...demo.workflows.map((item) => workflows.save(demoId, item)),
    ...demo.executions.map((item) => executions.save(demoId, item)),
    ...demo.activities.map((item) => activities.save(demoId, item)),
  ]);
  return services;
}

export type Services = Awaited<ReturnType<typeof createContainer>>;

const root = globalThis as typeof globalThis & {
  nodeflowContainer?: Promise<Services>;
};

export function getServices() {
  root.nodeflowContainer ??= createContainer();
  return root.nodeflowContainer;
}
