"use client";

import { Bell, Mail } from "lucide-react";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { usePreferences, useUpdatePreferences } from "../hooks/usePreferences";
import { notificationGroups } from "../lib/notification-groups";
import { SettingsSection } from "./SettingsSection";

const icons = [Mail, Bell];

export function NotificationsTab() {
  const { data } = usePreferences();
  const update = useUpdatePreferences();

  return notificationGroups.map((group, index) => {
    const active = group.items.filter((item) => data?.notifications[item.key]).length;
    return (
      <SettingsSection
        key={group.title}
        icon={icons[index]}
        title={group.title}
        aside={
          data && (
            <Badge variant={active > 0 ? "primary" : "neutral"}>
              {active}/{group.items.length} açık
            </Badge>
          )
        }
      >
        <ul className="-my-2 divide-y divide-line">
          {group.items.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{item.title}</p>
                <p className="text-caption text-fg-muted">{item.description}</p>
              </div>
              <Toggle
                label={item.title}
                checked={Boolean(data?.notifications[item.key])}
                disabled={!data}
                onChange={(value) =>
                  update.mutate({ notifications: { [item.key]: value } })
                }
              />
            </li>
          ))}
        </ul>
      </SettingsSection>
    );
  });
}
