import { authedRoute, readBody } from "@/server/http/route";
import { createWorkflowSchema } from "@/shared/contracts/workflow";

export const GET = authedRoute(async ({ services, user }) =>
  services.workflows.list(user.id),
);

export const POST = authedRoute(async ({ request, services, user }) => {
  const input = await readBody(request, createWorkflowSchema);
  return services.workflows.create(user.id, user.name, input);
});
