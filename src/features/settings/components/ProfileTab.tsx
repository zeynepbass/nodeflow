"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCurrentUser, useUpdateProfile } from "@/features/auth/hooks/useAuth";
import { updateProfileSchema, type UpdateProfileInput } from "@/shared/contracts/auth";
import { showToast } from "@/shared/stores/toast";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { FormField } from "@/shared/ui/molecules/FormField";

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
    <form
      noValidate
      className="flex flex-col gap-4"
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
      <div className="flex items-center gap-4">
        <Avatar name={user.name} size={64} />
        <div className="flex gap-4">
          <button
            type="button"
            onClick={photoNotice}
            className="font-medium text-link hover:underline"
          >
            Fotoğrafı Değiştir
          </button>
          <button
            type="button"
            onClick={photoNotice}
            className="font-medium text-fg-muted hover:underline"
          >
            Kaldır
          </button>
        </div>
      </div>
      <FormField label="Ad Soyad" htmlFor="ad" required error={errors.name?.message}>
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
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty} loading={update.isPending}>
          Kaydet
        </Button>
      </div>
    </form>
  );
}
