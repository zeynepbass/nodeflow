import { redirect } from "next/navigation";
import { getSession } from "@/server/http/session";

export default async function Page() {
  redirect((await getSession()) ? "/panel" : "/giris");
}
