"use client";

import { Toggle } from "@/shared/ui/atoms/Toggle";
import { usePreferences, useUpdatePreferences } from "../hooks/usePreferences";
import { notificationGroups } from "../lib/notification-groups";

export function NotificationsTab() {
  const { data } = usePreferences();
  const update = useUpdatePreferences();

  return (
    <div className="flex flex-col gap-8">
      {notificationGroups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-2 text-h3">{group.title}</h2>
          <ul className="divide-y divide-line">
            {group.items.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-4 py-3">
                <div>
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
        </section>
      ))}
    </div>
  );
}
