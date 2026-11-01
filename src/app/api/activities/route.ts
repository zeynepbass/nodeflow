import { authedRoute } from "@/server/http/route";

export const GET = authedRoute(async ({ services, user }) =>
  services.activities.recent(user.id),
);
