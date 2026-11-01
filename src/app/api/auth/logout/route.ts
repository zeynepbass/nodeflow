import { authedRoute } from "@/server/http/route";
import { clearSessionCookie } from "@/server/http/session";

export const POST = authedRoute(async ({ services, session }) => {
  await services.auth.logout(session.id);
  await clearSessionCookie();
});
