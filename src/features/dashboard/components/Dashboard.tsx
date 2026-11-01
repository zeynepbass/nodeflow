"use client";

import { CheckCheck, Clock, Plus, Timer, Workflow } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { EmptyState } from "@/shared/ui/molecules/EmptyState";
import { StatTile, StatTileSkeleton } from "@/shared/ui/molecules/StatTile";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { RecentRuns } from "@/features/dashboard/components/RecentRuns";
import { formatDuration } from "@/shared/lib/format";
import { useAuth } from "@/features/auth/store/auth";
import { useUi } from "@/shared/stores/ui";
import { useWorkspace } from "@/features/workflows/store/workspace";
import type { Execution } from "@/shared/domain/types";

const startOfToday = () => new Date().setHours(0, 0, 0, 0);

function summarize(executions: Execution[]) {
  const today = startOfToday();
  const day = 86400000;
  const at = (item: Execution) => new Date(item.startedAt).getTime();
  const finished = executions.filter((item) => item.status !== "running");
  const succeeded = finished.filter((item) => item.status === "success");
  const todayCount = executions.filter((item) => at(item) >= today).length;
  const yesterdayCount = executions.filter(
    (item) => at(item) >= today - day && at(item) < today,
  ).length;
  return {
    todayCount,
    difference: todayCount - yesterdayCount,
    successRate: finished.length
      ? Math.round((succeeded.length / finished.length) * 100)
      : 0,
    averageDuration: finished.length
      ? finished.reduce((sum, item) => sum + item.durationMs, 0) / finished.length
      : 0,
  };
}

export function Dashboard() {
  const user = useAuth((state) => state.user);
  const workflows = useWorkspace((state) => state.workflows);
  const executions = useWorkspace((state) => state.executions);
  const activities = useWorkspace((state) => state.activities);
  const hydrated = useWorkspace.persist.hasHydrated();
  const openNew = useUi((state) => state.setNewWorkflowOpen);
  const stats = useMemo(() => summarize(executions), [executions]);
  const active = workflows.filter((item) => item.status === "active").length;

  if (hydrated && workflows.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title="Henüz bir workflow'un yok"
        description="İlk otomasyonunu 2 dakikada kur."
        action={
          <Button onClick={() => openNew(true)}>
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            İlk Workflow&apos;unu Oluştur
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display max-md:text-h1">
            Tekrar hoş geldin, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-fg-muted">
            {active} aktif workflow, bugün {stats.todayCount} çalıştırma
          </p>
        </div>
        <Button onClick={() => openNew(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          Yeni Workflow
        </Button>
      </section>

      <section
        aria-label="Özet istatistikler"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {hydrated ? (
          <>
            <StatTile icon={Workflow} label="Toplam Workflow" value={String(workflows.length)} />
            <StatTile
              icon={Timer}
              label="Bugünkü Çalıştırmalar"
              value={String(stats.todayCount)}
              trend={{
                direction: stats.difference < 0 ? "down" : "up",
                label: `Düne göre ${stats.difference >= 0 ? "+" : ""}${stats.difference}`,
              }}
            />
            <StatTile
              icon={CheckCheck}
              label="Başarı Oranı"
              value={`%${stats.successRate}`}
              valueClassName="text-on-soft-success"
            />
            <StatTile
              icon={Clock}
              label="Ortalama Süre"
              value={formatDuration(stats.averageDuration)}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((index) => <StatTileSkeleton key={index} />)
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentRuns executions={executions.slice(0, 6)} />
        </div>
        <ActivityFeed activities={activities.slice(0, 6)} />
      </section>
    </div>
  );
}
