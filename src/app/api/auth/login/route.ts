import { clientInfo, publicRoute, readBody } from "@/server/http/route";
import { writeSessionCookie } from "@/server/http/session";
import { loginSchema } from "@/shared/contracts/auth";

export const POST = publicRoute(async ({ request, services }) => {
  const input = await readBody(request, loginSchema);
  const { session, user } = await services.auth.login(input, clientInfo(request));
  await writeSessionCookie(session.token, input.remember);
  return user;
});
