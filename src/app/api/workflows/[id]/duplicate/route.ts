import { authedRoute } from "@/server/http/route";

export const POST = authedRoute<{ id: string }>(async ({ params, services, user }) =>
  services.workflows.duplicate(user.id, params.id),
);
