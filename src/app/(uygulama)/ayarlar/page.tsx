import type { Metadata } from "next";
import { SettingsView } from "./SettingsView";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return <SettingsView />;
}
