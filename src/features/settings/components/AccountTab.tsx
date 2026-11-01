"use client";

import { useState } from "react";
import { useDeleteAccount } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { FormField } from "@/shared/ui/molecules/FormField";
import { Modal } from "@/shared/ui/molecules/Modal";
import { usePreferences, useUpdatePreferences } from "../hooks/usePreferences";
import { PasswordForm } from "./PasswordForm";
import { SessionList } from "./SessionList";

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
