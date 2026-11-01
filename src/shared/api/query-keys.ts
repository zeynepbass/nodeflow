export const queryKeys = {
  session: ["oturum"] as const,
  sessions: ["oturumlar"] as const,
  workflows: ["workflowlar"] as const,
  workflow: (id: string) => ["workflowlar", id] as const,
  executions: ["calistirmalar"] as const,
  activities: ["aktiviteler"] as const,
  preferences: ["tercihler"] as const,
};
