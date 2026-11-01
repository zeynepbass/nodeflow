"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { cn } from "@/shared/lib/cn";
import { useCurrentUser, useLogout } from "../hooks/useAuth";
import { Menu } from "@/shared/ui/molecules/Menu";

export function UserMenu({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const user = useCurrentUser();
  const logout = useLogout();
  return (
    <Menu
      direction="up"
      align="left"
      className="w-full"
      items={[
        { label: "Ayarlar", icon: Settings, onSelect: () => router.push("/ayarlar") },
        {
          label: "Çıkış Yap",
          icon: LogOut,
          onSelect: () => logout.mutate(),
        },
      ]}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Kullanıcı menüsü"
          onClick={toggle}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-surface-hover",
            compact && "justify-center px-0",
          )}
        >
          <Avatar name={user.name} />
          {!compact && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-caption text-fg-muted">
                  {user.email}
                </span>
              </span>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                aria-hidden
                className="text-fg-muted"
              />
            </>
          )}
        </button>
      )}
    />
  );
}
