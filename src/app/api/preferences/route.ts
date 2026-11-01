import { authedRoute, readBody } from "@/server/http/route";
import { updatePreferencesSchema } from "@/shared/contracts/preferences";

export const GET = authedRoute(async ({ services, user }) =>
  services.preferences.get(user.id),
);

export const PATCH = authedRoute(async ({ request, services, user }) => {
  const patch = await readBody(request, updatePreferencesSchema);
  return services.preferences.update(user.id, patch);
});
