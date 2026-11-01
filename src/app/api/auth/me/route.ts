import { authedRoute, readBody } from "@/server/http/route";
import { clearSessionCookie } from "@/server/http/session";
import { updateProfileSchema } from "@/shared/contracts/auth";

export const GET = authedRoute(async ({ user }) => user);

export const PATCH = authedRoute(async ({ request, services, user }) => {
  const patch = await readBody(request, updateProfileSchema);
  return services.auth.updateProfile(user.id, patch);
});

export const DELETE = authedRoute(async ({ services, user }) => {
  await services.account.delete(user.id);
  await clearSessionCookie();
});
