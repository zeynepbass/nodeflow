import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/server/http/session";
import { AuthTemplate } from "@/shared/ui/templates/AuthTemplate";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getSession()) redirect("/panel");
  return <AuthTemplate>{children}</AuthTemplate>;
}
