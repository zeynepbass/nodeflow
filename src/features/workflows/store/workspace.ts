import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@/shared/lib/id";
import { createDemoWorkspace, createStartNode, templates } from "@/server/seed/demo-workspace";
import type {
  Activity,
  Execution,
  StoredEdge,
  StoredNode,
  Workflow,
  WorkflowStatus,
} from "@/shared/domain/types";

interface WorkspaceData {
  owner: string | null;
  workflows: Workflow[];
  executions: Execution[];
  activities: Activity[];
}

interface WorkspaceState extends WorkspaceData {
  openWorkspace: (email: string, demo: boolean) => void;
  dropWorkspace: (email: string) => void;
  createWorkflow: (input: {
    name: string;
    description: string;
    templateId?: string;
  }) => string;
  duplicateWorkflow: (id: string) => string | undefined;
  removeWorkflows: (ids: string[]) => void;
  saveFlow: (
    id: string,
    flow: { name: string; nodes: StoredNode[]; edges: StoredEdge[] },
  ) => void;
  setStatus: (id: string, status: WorkflowStatus) => void;
  setSchedule: (id: string, schedule: string) => void;
  upsertExecution: (execution: Execution) => void;
  logActivity: (user: string, action: string, workflowName: string) => void;
}

const backupKey = (email: string) => `nodeflow-yedek-${email}`;

const empty = { workflows: [], executions: [], activities: [] };

const readBackup = (email: string) => {
  try {
    const raw = localStorage.getItem(backupKey(email));
    return raw ? (JSON.parse(raw) as Omit<WorkspaceData, "owner">) : null;
  } catch {
    return null;
  }
};

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      owner: null,
      ...empty,
      openWorkspace: (email, demo) => {
        const { owner, workflows, executions, activities } = get();
        if (owner === email) return;
        if (owner) {
          try {
            localStorage.setItem(
              backupKey(owner),
              JSON.stringify({ workflows, executions, activities }),
            );
          } catch {}
        }
        const next =
          readBackup(email) ?? (demo ? createDemoWorkspace() : empty);
        set({ owner: email, ...next });
      },
      dropWorkspace: (email) => {
        try {
          localStorage.removeItem(backupKey(email));
        } catch {}
        set({ owner: null, ...empty });
      },
      createWorkflow: ({ name, description, templateId }) => {
        const now = new Date().toISOString();
        const id = createId("akis");
        const template = templates.find((item) => item.id === templateId);
        const flow = template
          ? template.build()
          : { nodes: [createStartNode()], edges: [] };
        set((state) => ({
          workflows: [
            {
              id,
              name,
              description,
              status: "draft",
              tags: [],
              createdAt: now,
              updatedAt: now,
              ...flow,
            },
            ...state.workflows,
          ],
        }));
        return id;
      },
      duplicateWorkflow: (id) => {
        const source = get().workflows.find((item) => item.id === id);
        if (!source) return undefined;
        const now = new Date().toISOString();
        const copyId = createId("akis");
        const copy: Workflow = {
          ...structuredClone(source),
          id: copyId,
          name: `${source.name} (Kopya)`,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          lastRunAt: undefined,
        };
        set((state) => ({ workflows: [copy, ...state.workflows] }));
        return copyId;
      },
      removeWorkflows: (ids) =>
        set((state) => ({
          workflows: state.workflows.filter((item) => !ids.includes(item.id)),
          executions: state.executions.filter(
            (item) => !ids.includes(item.workflowId),
          ),
        })),
      saveFlow: (id, flow) =>
        set((state) => ({
          workflows: state.workflows.map((item) =>
            item.id === id
              ? { ...item, ...flow, updatedAt: new Date().toISOString() }
              : item,
          ),
        })),
      setStatus: (id, status) =>
        set((state) => ({
          workflows: state.workflows.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      setSchedule: (id, schedule) =>
        set((state) => ({
          workflows: state.workflows.map((item) =>
            item.id === id ? { ...item, schedule } : item,
          ),
        })),
      upsertExecution: (execution) =>
        set((state) => {
          const exists = state.executions.some(
            (item) => item.id === execution.id,
          );
          return {
            executions: exists
              ? state.executions.map((item) =>
                  item.id === execution.id ? execution : item,
                )
              : [execution, ...state.executions],
            workflows: state.workflows.map((item) =>
              item.id === execution.workflowId
                ? { ...item, lastRunAt: execution.startedAt }
                : item,
            ),
          };
        }),
      logActivity: (user, action, workflowName) =>
        set((state) => ({
          activities: [
            {
              id: createId("aktivite"),
              user,
              action,
              workflowName,
              at: new Date().toISOString(),
            },
            ...state.activities,
          ].slice(0, 30),
        })),
    }),
    { name: "nodeflow-calisma-alani", skipHydration: true },
  ),
);
