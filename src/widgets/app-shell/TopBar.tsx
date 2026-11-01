"use client";

import { ChevronRight, Menu as MenuIcon, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { ThemeSwitcher } from "@/features/theme/components/ThemeSwitcher";
import { navigation } from "@/widgets/app-shell/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useUi } from "@/shared/stores/ui";

export function TopBar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const setPaletteOpen = useUi((state) => state.setPaletteOpen);
  const setDrawerOpen = useUi((state) => state.setDrawerOpen);
  const current = navigation.find((item) => pathname.startsWith(item.href));
  const isDetail = current && pathname !== current.href;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 md:px-6 xl:px-10">
      <IconButton
        label="Menüyü aç"
        tooltip={false}
        className="lg:hidden"
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <nav aria-label="Konum" className="flex min-w-0 flex-1 items-center gap-1">
        {current && (
          <Link
            href={current.href}
            className={
              isDetail ? "truncate text-fg-muted hover:text-fg" : "truncate font-medium"
            }
          >
            {current.label}
          </Link>
        )}
        {isDetail && (
          <>
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className="shrink-0 text-fg-muted"
            />
            <span className="truncate font-medium">Detay</span>
          </>
        )}
      </nav>
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-10 w-64 items-center gap-2 rounded-sm border border-line px-3 text-fg-muted hover:bg-surface-hover md:flex"
      >
        <Search size={16} strokeWidth={1.5} aria-hidden />
        <span className="flex-1 text-left">Ara…</span>
        <kbd className="font-mono text-micro">⌘K</kbd>
      </button>
      <IconButton
        label="Ara"
        tooltip={false}
        className="md:hidden"
        onClick={() => setPaletteOpen(true)}
      >
        <Search size={20} strokeWidth={1.5} aria-hidden />
      </IconButton>
      <ThemeSwitcher />
      <Link
        href="/ayarlar"
        aria-label="Profil ayarları"
        className="hidden rounded-full md:block"
      >
        <Avatar name={user.name} />
      </Link>
    </header>
  );
}
