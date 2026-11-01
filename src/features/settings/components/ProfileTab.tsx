"use client";

import { useState } from "react";
import { Avatar } from "@/shared/ui/atoms/Avatar";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Select } from "@/shared/ui/atoms/Select";
import { FormField } from "@/shared/ui/molecules/FormField";
import { useAuth } from "@/features/auth/store/auth";
import { showToast } from "@/shared/stores/toast";

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
  const user = useAuth((state) => state.user)!;
  const updateProfile = useAuth((state) => state.updateProfile);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [timezone, setTimezone] = useState(user.timezone);
  const [nameError, setNameError] = useState<string>();

  const dirty =
    name !== user.name || username !== user.username || timezone !== user.timezone;

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) {
          setNameError("Bu alan zorunlu");
          return;
        }
        setNameError(undefined);
        await updateProfile({ name: name.trim(), username: username.trim(), timezone });
        showToast({ message: "Değişiklikler kaydedildi." });
      }}
    >
      <div className="flex items-center gap-4">
        <Avatar name={user.name} size={64} />
        <div className="flex gap-4">
          <button type="button" onClick={photoNotice} className="font-medium text-link hover:underline">
            Fotoğrafı Değiştir
          </button>
          <button type="button" onClick={photoNotice} className="font-medium text-fg-muted hover:underline">
            Kaldır
          </button>
        </div>
      </div>
      <FormField label="Ad Soyad" htmlFor="ad" required error={nameError}>
        <Input
          id="ad"
          value={name}
          invalid={Boolean(nameError)}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      <FormField label="Kullanıcı adı" htmlFor="kullanici">
        <Input id="kullanici" value={username} onChange={(event) => setUsername(event.target.value)} />
      </FormField>
      <FormField
        label="E-posta"
        htmlFor="eposta"
        hint="Değiştirmek için destek ile iletişime geç."
      >
        <Input id="eposta" value={user.email} readOnly />
      </FormField>
      <FormField label="Zaman Dilimi" htmlFor="zaman">
        <Select
          id="zaman"
          value={timezone}
          options={timezones}
          onChange={(event) => setTimezone(event.target.value)}
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={!dirty}>
          Kaydet
        </Button>
      </div>
    </form>
  );
}
