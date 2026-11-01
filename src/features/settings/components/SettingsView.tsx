"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { AccountTab } from "@/features/settings/components/AccountTab";
import { NotificationsTab } from "@/features/settings/components/NotificationsTab";
import { ProfileTab } from "@/features/settings/components/ProfileTab";
import { ThemeTab } from "@/features/settings/components/ThemeTab";

const tabs = [
  { id: "profile", label: "Profil", content: ProfileTab },
  { id: "theme", label: "Tema", content: ThemeTab },
  { id: "notifications", label: "Bildirimler", content: NotificationsTab },
  { id: "account", label: "Hesap", content: AccountTab },
];

export function SettingsView() {
  const [active, setActive] = useState(tabs[0].id);
  const Content = tabs.find((tab) => tab.id === active)!.content;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Ayarlar</h1>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <div
          role="tablist"
          aria-label="Ayarlar"
          aria-orientation="vertical"
          className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active}
              onClick={() => setActive(tab.id)}
              className={cn(
                "h-10 shrink-0 rounded-sm px-3 text-left font-medium transition-colors duration-100",
                tab.id === active
                  ? "bg-soft-primary text-on-soft-primary"
                  : "text-fg-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="min-w-0 max-w-2xl flex-1">
          <Content />
        </div>
      </div>
    </div>
  );
}
