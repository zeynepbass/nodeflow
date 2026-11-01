import { authedRoute, readBody } from "@/server/http/route";
import { updateWorkflowSchema } from "@/shared/contracts/workflow";

interface Params {
  id: string;
}

export const GET = authedRoute<Params>(async ({ params, services, user }) =>
  services.workflows.get(user.id, params.id),
);

export const PATCH = authedRoute<Params>(async ({ request, params, services, user }) => {
  const patch = await readBody(request, updateWorkflowSchema);
  return services.workflows.update(user.id, params.id, patch);
});

export const DELETE = authedRoute<Params>(async ({ params, services, user }) => {
  await services.workflows.remove(user.id, [params.id]);
});
