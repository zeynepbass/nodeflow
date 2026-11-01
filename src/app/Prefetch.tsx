import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getServices, type Services } from "@/server/container";
import { getSession } from "@/server/http/session";

type Loader = (context: { services: Services; userId: string }) => Promise<unknown>;

export async function Prefetch({
  queries,
  children,
}: {
  queries: [QueryKey, Loader][];
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) return children;
  const services = await getServices();
  const client = new QueryClient();
  const context = { services, userId: session.user.id };
  await Promise.allSettled(
    queries.map(async ([key, load]) => client.setQueryData(key, await load(context))),
  );
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
