"use client";

import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { LogoMark } from "@/shared/ui/atoms/LogoMark";
import { Tooltip } from "@/shared/ui/atoms/Tooltip";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { cn } from "@/shared/lib/cn";
import { navigation } from "@/widgets/app-shell/navigation";
import { useUi } from "@/shared/stores/ui";

function NavLinks({
  compact,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Ana menü" className="flex flex-1 flex-col gap-1 p-3">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        const link = (
          <Link
            href={href}
            onClick={onNavigate}
            aria-label={compact ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-sm px-3 font-medium transition-colors duration-100",
              compact && "justify-center px-0",
              active
                ? "bg-soft-primary text-on-soft-primary"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg",
            )}
          >
            <Icon size={20} strokeWidth={1.5} aria-hidden />
            {!compact && label}
          </Link>
        );
        return compact ? (
          <Tooltip key={href} content={label} side="right" className="w-full">
            {link}
          </Tooltip>
        ) : (
          <span key={href}>{link}</span>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const [preference, setPreference] = useState<boolean | null>(null);
  const drawerOpen = useUi((state) => state.drawerOpen);
  const setDrawerOpen = useUi((state) => state.setDrawerOpen);

  const wide = (compact: boolean) => (
    <aside
      className={cn(
        "sticky top-0 h-dvh shrink-0 flex-col border-r border-line bg-surface",
        compact ? "w-[72px]" : "w-60",
      )}
      data-compact={compact}
    >
      <div
        className={cn(
          "flex h-16 items-center px-4",
          compact ? "justify-center" : "justify-between",
        )}
      >
        <LogoMark wordmark={!compact} />
        {!compact && (
          <IconButton
            label="Menüyü daralt"
            size="sm"
            tooltipSide="right"
            onClick={() => setPreference(true)}
          >
            <PanelLeftClose size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        )}
      </div>
      {compact && (
        <div className="flex justify-center">
          <IconButton
            label="Menüyü genişlet"
            size="sm"
            tooltipSide="right"
            onClick={() => setPreference(false)}
          >
            <PanelLeftOpen size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        </div>
      )}
      <NavLinks compact={compact} />
      <div className="border-t border-line p-3">
        <UserMenu compact={compact} />
      </div>
    </aside>
  );

  return (
    <>
      {preference === null ? (
        <>
          <div className="contents max-lg:hidden xl:hidden [&>aside]:flex">
            {wide(true)}
          </div>
          <div className="contents max-xl:hidden [&>aside]:flex">{wide(false)}</div>
        </>
      ) : (
        <div className="contents max-lg:hidden [&>aside]:flex">{wide(preference)}</div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 size-full animate-fade-in bg-[rgb(14_15_20/0.45)]"
          />
          <aside className="absolute inset-y-0 left-0 flex w-full flex-col bg-surface shadow-elevation-4 md:w-72">
            <div className="flex h-16 items-center justify-between px-4">
              <LogoMark wordmark />
              <IconButton
                label="Menüyü kapat"
                tooltip={false}
                onClick={() => setDrawerOpen(false)}
              >
                <X size={20} strokeWidth={1.5} aria-hidden />
              </IconButton>
            </div>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-line p-3">
              <UserMenu />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
