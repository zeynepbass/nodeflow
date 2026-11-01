import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/shared/ui/atoms/Input";
import { cn } from "@/shared/lib/cn";

export function SearchBar({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cn("relative block", className)}>
      <Search
        size={16}
        strokeWidth={1.5}
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 text-fg-muted"
      />
      <Input type="search" className="pl-9" {...props} />
    </span>
  );
}
