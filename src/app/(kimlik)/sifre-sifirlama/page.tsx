import type { Metadata } from "next";
import { ResetForm } from "@/features/auth/components/ResetForm";

export const metadata: Metadata = { title: "Şifre Sıfırlama" };

export default function Page() {
  return <ResetForm />;
}
