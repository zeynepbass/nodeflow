import { authedRoute } from "@/server/http/route";

export const DELETE = authedRoute<{ id: string }>(async ({ params, services, user }) => {
  await services.auth.endSession(user.id, params.id);
});
