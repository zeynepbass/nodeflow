import { publicRoute, readBody } from "@/server/http/route";
import { passwordResetSchema } from "@/shared/contracts/auth";

export const POST = publicRoute(async ({ request }) => {
  await readBody(request, passwordResetSchema);
});
