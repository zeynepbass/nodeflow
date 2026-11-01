import { authedRoute } from "@/server/http/route";

export const GET = authedRoute(async ({ services, user, session }) =>
  services.auth.listSessions(user.id, session.id),
);
