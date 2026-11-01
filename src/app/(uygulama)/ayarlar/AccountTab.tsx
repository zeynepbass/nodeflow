"use client";

import { Check, Laptop, Smartphone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Toggle } from "@/components/atoms/Toggle";
import { FormField } from "@/components/molecules/FormField";
import { Modal } from "@/components/molecules/Modal";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { cn } from "@/lib/cn";
import { passwordRules, passwordScore } from "@/lib/password";
import { useAuth } from "@/lib/stores/auth";
import { usePreferences } from "@/lib/stores/preferences";
import { showToast } from "@/lib/stores/toast";

function PasswordForm() {
  const changePassword = useAuth((state) => state.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [errors, setErrors] = useState<{ current?: string; repeat?: string }>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordScore(next) < passwordRules.length) return;
    if (next !== repeat) {
      setErrors({ repeat: "Şifreler eşleşmiyor." });
      return;
    }
    const ok = await changePassword(current, next);
    if (!ok) {
      setErrors({ current: "Mevcut şifre hatalı." });
      return;
    }
    setErrors({});
    setCurrent("");
    setNext("");
    setRepeat("");
    showToast({ message: "Şifren değiştirildi." });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <h2 className="text-h3">Şifre değiştir</h2>
      <FormField label="Mevcut şifre" htmlFor="mevcut" error={errors.current}>
        <PasswordInput
          id="mevcut"
          autoComplete="current-password"
          value={current}
          invalid={Boolean(errors.current)}
          onChange={(event) => setCurrent(event.target.value)}
        />
      </FormField>
      <FormField label="Yeni şifre" htmlFor="yeni">
        <PasswordInput
          id="yeni"
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
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
      <FormField label="Yeni şifre tekrar" htmlFor="tekrar" error={errors.repeat}>
        <PasswordInput
          id="tekrar"
          autoComplete="new-password"
          value={repeat}
          invalid={Boolean(errors.repeat)}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={!current || !next}>
          Şifreyi Güncelle
        </Button>
      </div>
    </form>
  );
}

const initialSessions = [
  { id: "bu", device: "MacBook · Chrome", location: "İstanbul", icon: Laptop, current: true },
  { id: "telefon", device: "iPhone · Safari", location: "Ankara", icon: Smartphone, current: false },
];

export function AccountTab() {
  const router = useRouter();
  const deleteAccount = useAuth((state) => state.deleteAccount);
  const twoFactor = usePreferences((state) => state.twoFactor);
  const setTwoFactor = usePreferences((state) => state.setTwoFactor);
  const [sessions, setSessions] = useState(initialSessions);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

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
          onChange={setTwoFactor}
        />
      </section>

      <section>
        <h2 className="mb-2 text-h3">Aktif oturumlar</h2>
        <ul className="divide-y divide-line">
          {sessions.map(({ id, device, location, icon: Icon, current }) => (
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
                  onClick={() => {
                    setSessions((value) => value.filter((item) => item.id !== id));
                    showToast({ message: "Oturum sonlandırıldı." });
                  }}
                >
                  Sonlandır
                </Button>
              )}
            </li>
          ))}
        </ul>
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
              onClick={async () => {
                await deleteAccount();
                router.push("/giris");
              }}
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
