import { Avatar } from "@/shared/ui/atoms/Avatar";
import { timeAgo } from "@/shared/lib/format";
import type { Activity } from "@/shared/domain/types";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-elevation-1">
      <h2 className="mb-3 text-h2">Son Aktiviteler</h2>
      {activities.length === 0 ? (
        <p className="py-6 text-center text-fg-muted">Henüz aktivite yok.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {activities.map((item) => (
            <li key={item.id} className="flex gap-3">
              <Avatar name={item.user} />
              <div className="min-w-0">
                <p>
                  {item.user} {item.action}{" "}
                  <span className="font-semibold">{item.workflowName}</span>
                </p>
                <p className="text-caption text-fg-muted">{timeAgo(item.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
