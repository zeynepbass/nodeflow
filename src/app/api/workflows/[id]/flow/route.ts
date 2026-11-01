import { authedRoute, readBody } from "@/server/http/route";
import { saveFlowSchema } from "@/shared/contracts/workflow";

export const PUT = authedRoute<{ id: string }>(
  async ({ request, params, services, user }) => {
    const flow = await readBody(request, saveFlowSchema);
    return services.workflows.saveFlow(user.id, params.id, flow);
  },
);
