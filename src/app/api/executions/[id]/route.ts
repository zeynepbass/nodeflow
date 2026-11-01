import { authedRoute, readBody } from "@/server/http/route";
import { finishExecutionSchema } from "@/shared/contracts/execution";

interface Params {
  id: string;
}

export const GET = authedRoute<Params>(async ({ params, services, user }) =>
  services.executions.get(user.id, params.id),
);

export const PATCH = authedRoute<Params>(async ({ request, params, services, user }) => {
  const input = await readBody(request, finishExecutionSchema);
  return services.executions.finish(user.id, params.id, input);
});
