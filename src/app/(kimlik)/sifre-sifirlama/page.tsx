import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Şifre Sıfırlama" };

export default function Page() {
  return <ResetForm />;
}
