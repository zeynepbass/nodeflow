"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { Divider } from "@/shared/ui/atoms/Divider";
import { Input } from "@/shared/ui/atoms/Input";
import { TextLink } from "@/shared/ui/atoms/TextLink";
import { Tooltip } from "@/shared/ui/atoms/Tooltip";
import { FormField } from "@/shared/ui/molecules/FormField";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PasswordInput } from "@/shared/ui/molecules/PasswordInput";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { passwordScore } from "@/shared/domain/password";
import { useAuth } from "@/features/auth/store/auth";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  exists?: boolean;
}

export function RegisterForm() {
  const router = useRouter();
  const register = useAuth((state) => state.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {
      name: name.trim() ? undefined : "Bu alan zorunlu",
      email: !email.trim()
        ? "Bu alan zorunlu"
        : /^\S+@\S+\.\S+$/.test(email)
          ? undefined
          : "Geçerli bir e-posta adresi gir.",
      password: !password
        ? "Bu alan zorunlu"
        : passwordScore(password) < 2
          ? "Daha güçlü bir şifre seç."
          : undefined,
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;
    setLoading(true);
    const result = await register({ name, email, password });
    if (result === "exists") {
      setErrors({ exists: true });
      setLoading(false);
      return;
    }
    router.push("/panel");
  };

  const button = (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={!accepted}
      loading={loading}
    >
      Hesap Oluştur
    </Button>
  );

  return (
    <AuthCard
      title="Workspace'ini oluştur"
      description="Kod yazmadan otomasyonlarını kurmaya başla."
      width="max-w-[420px]"
      footer={
        <>
          Zaten hesabın var mı? <TextLink href="/giris">Giriş yap</TextLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField label="Ad Soyad" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            invalid={Boolean(errors.name)}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormField
          label="Çalışma e-postası"
          htmlFor="email"
          required
          error={
            errors.exists ? (
              <>
                Bu e-posta zaten kullanılıyor.{" "}
                <TextLink href="/giris">Giriş yapmayı dene.</TextLink>
              </>
            ) : (
              errors.email
            )
          }
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            invalid={Boolean(errors.email || errors.exists)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField label="Şifre" htmlFor="password" required error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            invalid={Boolean(errors.password)}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength value={password} />
        </FormField>
        <Checkbox
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          label="Kullanım Şartları ve Gizlilik Politikası'nı okudum, kabul ediyorum."
        />
        {accepted ? (
          button
        ) : (
          <Tooltip content="Devam etmek için şartları kabul et." className="block w-full">
            <span className="block w-full">{button}</span>
          </Tooltip>
        )}
        <Divider label="veya" />
        <GoogleButton label="Google ile kayıt ol" />
      </form>
    </AuthCard>
  );
}
