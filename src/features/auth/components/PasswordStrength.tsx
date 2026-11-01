import { passwordScore } from "@/shared/domain/password";
import { cn } from "@/shared/lib/cn";

const levels = [
  { label: "Zayıf şifre", color: "bg-state-error" },
  { label: "Orta şifre", color: "bg-state-warning" },
  { label: "Güçlü şifre", color: "bg-state-success" },
];

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = Math.max(1, passwordScore(value));
  const level = levels[score - 1];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {levels.map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-150",
              index < score ? level.color : "bg-line",
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-caption text-fg-muted">{level.label}</p>
    </div>
  );
}
