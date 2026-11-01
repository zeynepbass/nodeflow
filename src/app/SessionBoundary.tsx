import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/server/http/session";
import { queryKeys } from "@/shared/api/query-keys";

export async function SessionBoundary({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris");
  const client = new QueryClient();
  client.setQueryData(queryKeys.session, session.user);
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
