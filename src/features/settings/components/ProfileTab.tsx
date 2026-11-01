"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, IdCard, Mail, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCurrentUser, useUpdateProfile } from "@/features/auth/hooks/useAuth";
import { updateProfileSchema, type UpdateProfileInput } from "@/shared/contracts/auth";
import { showToast } from "@/shared/stores/toast";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { FormField } from "@/shared/ui/molecules/FormField";
import { SettingsSection } from "./SettingsSection";

const timezones = [
  { value: "Europe/Istanbul", label: "İstanbul (UTC+3)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
  { value: "Europe/London", label: "Londra (UTC+0)" },
  { value: "America/New_York", label: "New York (UTC-5)" },
];

const photoNotice = () =>
  showToast({
    variant: "info",
    message: "Fotoğraf yükleme bu örnek sürümde kapalı.",
  });

export function ProfileTab() {
  const user = useCurrentUser();
  const update = useUpdateProfile();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      timezone: user.timezone,
    },
  });
  const { errors, isDirty } = form.formState;

  return (
    <>
      <section className="overflow-hidden rounded-xl bg-surface shadow-elevation-1">
        <div
          aria-hidden
          className="h-24 bg-[linear-gradient(120deg,var(--primary-500),var(--secondary-500))]"
        />
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <Avatar
            name={user.name}
            size={80}
            className="-mt-10 ring-4 ring-[var(--bg-surface)]"
          />
          <div className="min-w-0 flex-1 pt-3">
            <h2 className="truncate text-h2">{user.name}</h2>
            <p className="flex items-center gap-1 truncate text-caption text-fg-muted">
              <Mail size={14} strokeWidth={1.5} aria-hidden />
              {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={photoNotice}>
              <Camera size={16} strokeWidth={1.5} aria-hidden />
              Fotoğrafı Değiştir
            </Button>
            <Button variant="ghost" size="sm" onClick={photoNotice}>
              <Trash2 size={16} strokeWidth={1.5} aria-hidden />
              Kaldır
            </Button>
          </div>
        </div>
      </section>

      <form
        noValidate
        onSubmit={form.handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: (saved) => {
              form.reset({
                name: saved.name,
                username: saved.username,
                timezone: saved.timezone,
              });
              showToast({ message: "Değişiklikler kaydedildi." });
            },
          }),
        )}
      >
        <SettingsSection
          icon={IdCard}
          title="Kişisel bilgiler"
          description="Ekip arkadaşların seni bu bilgilerle görür."
          footer={
            <Button type="submit" disabled={!isDirty} loading={update.isPending}>
              Kaydet
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Ad Soyad"
              htmlFor="ad"
              required
              error={errors.name?.message}
            >
              <Input id="ad" invalid={Boolean(errors.name)} {...form.register("name")} />
            </FormField>
            <FormField
              label="Kullanıcı adı"
              htmlFor="kullanici"
              required
              error={errors.username?.message}
            >
              <Input
                id="kullanici"
                invalid={Boolean(errors.username)}
                {...form.register("username")}
              />
            </FormField>
            <FormField
              label="E-posta"
              htmlFor="eposta"
              hint="Değiştirmek için destek ile iletişime geç."
            >
              <Input id="eposta" value={user.email} readOnly />
            </FormField>
            <FormField label="Zaman Dilimi" htmlFor="zaman">
              <Select id="zaman" options={timezones} {...form.register("timezone")} />
            </FormField>
          </div>
        </SettingsSection>
      </form>
    </>
  );
}
