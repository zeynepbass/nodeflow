import { clientInfo, publicRoute, readBody } from "@/server/http/route";
import { writeSessionCookie } from "@/server/http/session";
import { registerSchema } from "@/shared/contracts/auth";

export const POST = publicRoute(async ({ request, services }) => {
  const input = await readBody(request, registerSchema);
  const { session, user } = await services.auth.register(input, clientInfo(request));
  await writeSessionCookie(session.token, true);
  return user;
});
