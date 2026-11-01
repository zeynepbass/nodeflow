"use client";

import { Bell, Palette, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { AccountTab } from "./AccountTab";
import { NotificationsTab } from "./NotificationsTab";
import { ProfileTab } from "./ProfileTab";
import { ThemeTab } from "./ThemeTab";

const tabs = [
  {
    id: "profile",
    label: "Profil",
    description: "Kişisel bilgilerin",
    icon: UserRound,
    content: ProfileTab,
  },
  {
    id: "theme",
    label: "Tema",
    description: "Arayüz görünümü",
    icon: Palette,
    content: ThemeTab,
  },
  {
    id: "notifications",
    label: "Bildirimler",
    description: "E-posta ve uygulama içi",
    icon: Bell,
    content: NotificationsTab,
  },
  {
    id: "account",
    label: "Hesap",
    description: "Güvenlik ve oturumlar",
    icon: ShieldCheck,
    content: AccountTab,
  },
];

export function SettingsView() {
  const [active, setActive] = useState(tabs[0].id);
  const Content = tabs.find((tab) => tab.id === active)!.content;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">Ayarlar</h1>
        <p className="mt-1 text-fg-muted">
          Profilini, görünümü, bildirimleri ve hesap güvenliğini buradan yönet.
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-8">
        <div
          role="tablist"
          aria-label="Ayarlar"
          className="flex gap-2 overflow-x-auto rounded-xl bg-surface p-2 shadow-elevation-1 lg:sticky lg:top-24 lg:flex-col lg:gap-1"
        >
          {tabs.map(({ id, label, description, icon: Icon }) => {
            const selected = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(id)}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-100",
                  selected
                    ? "bg-soft-primary text-on-soft-primary"
                    : "text-fg-muted hover:bg-surface-hover hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
                    selected ? "bg-action text-white" : "bg-surface-hover",
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} aria-hidden />
                </span>
                <span>
                  <span className="block font-medium">{label}</span>
                  <span
                    className={cn(
                      "hidden text-caption lg:block",
                      selected ? "text-on-soft-primary" : "text-fg-muted",
                    )}
                  >
                    {description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div role="tabpanel" className="flex min-w-0 max-w-3xl flex-col gap-6">
          <Content />
        </div>
      </div>
    </div>
  );
}
