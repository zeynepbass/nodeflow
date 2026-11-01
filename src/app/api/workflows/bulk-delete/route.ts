import { authedRoute, readBody } from "@/server/http/route";
import { bulkDeleteSchema } from "@/shared/contracts/workflow";

export const POST = authedRoute(async ({ request, services, user }) => {
  const { ids } = await readBody(request, bulkDeleteSchema);
  await services.workflows.remove(user.id, ids);
});
