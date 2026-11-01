"use client";

import { MonitorSmartphone, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useDeleteAccount } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { usePreferences, useUpdatePreferences } from "../hooks/usePreferences";
import { PasswordForm } from "./PasswordForm";
import { SessionList } from "./SessionList";
import { SettingsSection } from "./SettingsSection";

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
    <>
      <PasswordForm />

      <SettingsSection
        icon={ShieldCheck}
        title="İki adımlı doğrulama"
        description="Girişte ek bir doğrulama adımıyla hesabını korur."
        aside={
          <div className="flex items-center gap-3">
            <Badge variant={twoFactor ? "success" : "neutral"}>
              {twoFactor ? "Aktif" : "Aktif Değil"}
            </Badge>
            <Toggle
              label="İki adımlı doğrulama"
              checked={twoFactor}
              disabled={!preferences}
              onChange={(value) => updatePreferences.mutate({ twoFactor: value })}
            />
          </div>
        }
      />

      <SettingsSection
        icon={MonitorSmartphone}
        title="Aktif oturumlar"
        description="Tanımadığın bir cihaz görürsen oturumu sonlandır."
      >
        <SessionList />
      </SettingsSection>

      <SettingsSection
        danger
        icon={TriangleAlert}
        title="Tehlikeli Bölge"
        description="Hesabın ve tüm workflow'ların kalıcı olarak silinir."
        aside={
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Hesabı Sil
          </Button>
        }
      />

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
    </>
  );
}
