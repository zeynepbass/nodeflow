"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Laptop, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  useChangePassword,
  useDeleteAccount,
  useEndSession,
  useSessions,
} from "@/features/auth/hooks/useAuth";
import { cn } from "@/shared/lib/cn";
import { ApiError } from "@/shared/api/http-client";
import { changePasswordSchema, type ChangePasswordInput } from "@/shared/contracts/auth";
import { passwordRules } from "@/shared/domain/password";
import { showToast } from "@/shared/stores/toast";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { PasswordInput } from "@/shared/ui/molecules/PasswordInput";
import { usePreferences, useUpdatePreferences } from "../hooks/usePreferences";

function PasswordForm() {
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
      className="flex flex-col gap-4"
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
      <h2 className="text-h3">Şifre değiştir</h2>
      <FormField label="Mevcut şifre" htmlFor="mevcut" error={errors.current?.message}>
        <PasswordInput
          id="mevcut"
          autoComplete="current-password"
          invalid={Boolean(errors.current)}
          {...form.register("current")}
        />
      </FormField>
      <FormField label="Yeni şifre" htmlFor="yeni">
        <PasswordInput id="yeni" autoComplete="new-password" {...form.register("next")} />
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
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" loading={change.isPending}>
          Şifreyi Güncelle
        </Button>
      </div>
    </form>
  );
}

function SessionList() {
  const { data } = useSessions();
  const end = useEndSession();

  if (!data) {
    return (
      <div className="flex justify-center py-4 text-fg-muted">
        <Spinner />
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line">
      {data.map(({ id, device, location, current }) => {
        const Icon = /iPhone|Android/.test(device) ? Smartphone : Laptop;
        return (
          <li key={id} className="flex items-center gap-3 py-3">
            <Icon size={20} strokeWidth={1.5} aria-hidden className="text-fg-muted" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{device}</p>
              <p className="text-caption text-fg-muted">{location}</p>
            </div>
            {current ? (
              <Badge variant="primary">Bu Oturum</Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  end.mutate(id, {
                    onSuccess: () => showToast({ message: "Oturum sonlandırıldı." }),
                  })
                }
              >
                Sonlandır
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AccountTab() {
  const remove = useDeleteAccount();
  const { data: preferences } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const twoFactor = preferences?.twoFactor ?? false;

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmation("");
  };

  return (
    <div className="flex flex-col gap-8">
      <PasswordForm />

      <section className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-h3">İki adımlı doğrulama</h2>
          <p className="text-caption text-fg-muted">
            {twoFactor ? "Aktif" : "Aktif Değil"}
          </p>
        </div>
        <Toggle
          label="İki adımlı doğrulama"
          checked={twoFactor}
          disabled={!preferences}
          onChange={(value) => updatePreferences.mutate({ twoFactor: value })}
        />
      </section>

      <section>
        <h2 className="mb-2 text-h3">Aktif oturumlar</h2>
        <SessionList />
      </section>

      <section className="rounded-lg border border-error-500/40 p-5">
        <h2 className="text-h3 text-state-error">Tehlikeli Bölge</h2>
        <p className="mt-1 text-fg-muted">
          Hesabın ve tüm workflow&apos;ların kalıcı olarak silinir.
        </p>
        <Button
          variant="ghost"
          className="mt-3 text-state-error hover:bg-soft-error hover:text-on-soft-error"
          onClick={() => setDeleteOpen(true)}
        >
          Hesabı Sil
        </Button>
      </section>

      <Modal
        open={deleteOpen}
        onClose={closeDelete}
        title="Hesabı sil"
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete}>
              İptal
            </Button>
            <Button
              variant="destructive"
              disabled={confirmation !== "SİL"}
              loading={remove.isPending}
              onClick={() => remove.mutate()}
            >
              Hesabı Sil
            </Button>
          </>
        }
      >
        <FormField
          label="Onaylamak için SİL yaz"
          htmlFor="sil-onay"
          hint="Bu işlem geri alınamaz."
        >
          <Input
            id="sil-onay"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </FormField>
      </Modal>
    </div>
  );
}
