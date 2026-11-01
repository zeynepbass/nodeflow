import { authedRoute, readBody } from "@/server/http/route";
import { startExecutionSchema } from "@/shared/contracts/execution";

export const GET = authedRoute(async ({ services, user }) =>
  services.executions.list(user.id),
);

export const POST = authedRoute(async ({ request, services, user }) => {
  const input = await readBody(request, startExecutionSchema);
  return services.executions.start(user.id, user.name, input);
});
