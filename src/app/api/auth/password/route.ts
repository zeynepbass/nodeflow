import { authedRoute, readBody } from "@/server/http/route";
import { changePasswordSchema } from "@/shared/contracts/auth";

export const POST = authedRoute(async ({ request, services, user }) => {
  const { current, next } = await readBody(request, changePasswordSchema);
  await services.auth.changePassword(user.id, current, next);
});
