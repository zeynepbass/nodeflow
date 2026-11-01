"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Divider } from "@/components/atoms/Divider";
import { Input } from "@/components/atoms/Input";
import { TextLink } from "@/components/atoms/TextLink";
import { FormField } from "@/components/molecules/FormField";
import { GoogleButton } from "@/components/molecules/GoogleButton";
import { InlineNotice } from "@/components/molecules/InlineNotice";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { AuthCard } from "@/components/organisms/AuthCard";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/lib/stores/auth";

export function LoginForm() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = {
      email: email.trim() ? undefined : "Bu alan zorunlu",
      password: password ? undefined : "Bu alan zorunlu",
    };
    setErrors(next);
    setFailed(false);
    if (next.email || next.password) return;
    setStatus("loading");
    const ok = await login(email, password, remember);
    if (!ok) {
      setFailed(true);
      setStatus("idle");
      return;
    }
    setStatus("done");
    window.setTimeout(() => router.push("/panel"), 300);
  };

  const busy = status !== "idle";

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      description="Workflow'larına devam etmek için giriş yap"
      footer={
        <>
          Hesabın yok mu? <TextLink href="/kayit">Kayıt ol</TextLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {failed && (
          <InlineNotice variant="error">E-posta veya şifre hatalı.</InlineNotice>
        )}
        <FormField label="E-posta" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={busy}
            invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField label="Şifre" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            disabled={busy}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Checkbox
            label="Beni hatırla"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <TextLink href="/sifre-sifirlama" className="text-body">
            Şifremi unuttum
          </TextLink>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={status === "loading"}
        >
          {status === "done" ? (
            <>
              <Check size={16} strokeWidth={2} aria-hidden /> Giriş yapıldı
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
        <Divider label="veya" />
        <GoogleButton label="Google ile giriş yap" />
        <InlineNotice>
          Örnek hesap: <span className="font-mono text-code">{DEMO_EMAIL}</span>{" "}
          · <span className="font-mono text-code">{DEMO_PASSWORD}</span>
        </InlineNotice>
      </form>
    </AuthCard>
  );
}
