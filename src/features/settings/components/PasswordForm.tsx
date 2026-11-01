"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, KeyRound, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useChangePassword } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/shared/api/http-client";
import { changePasswordSchema, type ChangePasswordInput } from "@/shared/contracts/auth";
import { passwordRules } from "@/shared/domain/password";
import { cn } from "@/shared/lib/cn";
import { showToast } from "@/shared/stores/toast";
import { Button } from "@/shared/ui/atoms/Button";
import { FormField } from "@/shared/ui/molecules/FormField";
import { PasswordInput } from "@/shared/ui/molecules/PasswordInput";
import { SettingsSection } from "./SettingsSection";

export function PasswordForm() {
  const change = useChangePassword();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: "", next: "", repeat: "" },
  });
  const { errors } = form.formState;
  const next = useWatch({ control: form.control, name: "next" });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) =>
        change.mutate(values, {
          onSuccess: () => {
            form.reset();
            showToast({ message: "Şifren değiştirildi." });
          },
          onError: (error) => {
            if (error instanceof ApiError && error.code === "mevcut-sifre-hatali") {
              form.setError("current", { message: error.message });
            } else {
              showToast({ variant: "error", message: error.message });
            }
          },
        }),
      )}
    >
      <SettingsSection
        icon={KeyRound}
        title="Şifre değiştir"
        description="Güçlü ve başka yerde kullanmadığın bir şifre seç."
        footer={
          <Button type="submit" loading={change.isPending}>
            Şifreyi Güncelle
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label="Mevcut şifre"
              htmlFor="mevcut"
              error={errors.current?.message}
            >
              <PasswordInput
                id="mevcut"
                autoComplete="current-password"
                invalid={Boolean(errors.current)}
                {...form.register("current")}
              />
            </FormField>
          </div>
          <FormField label="Yeni şifre" htmlFor="yeni">
            <PasswordInput
              id="yeni"
              autoComplete="new-password"
              {...form.register("next")}
            />
            {next && (
              <ul className="mt-2 flex flex-col gap-1 text-caption">
                {passwordRules.map((rule) => {
                  const passed = rule.test(next);
                  const Icon = passed ? Check : X;
                  return (
                    <li
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1",
                        passed ? "text-on-soft-success" : "text-on-soft-error",
                      )}
                    >
                      <Icon size={14} strokeWidth={2} aria-hidden />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </FormField>
          <FormField
            label="Yeni şifre tekrar"
            htmlFor="tekrar"
            error={errors.repeat?.message}
          >
            <PasswordInput
              id="tekrar"
              autoComplete="new-password"
              invalid={Boolean(errors.repeat)}
              {...form.register("repeat")}
            />
          </FormField>
        </div>
      </SettingsSection>
    </form>
  );
}
