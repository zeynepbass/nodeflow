"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/shared/contracts/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/shared/domain/demo";
import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { Divider } from "@/shared/ui/atoms/Divider";
import { Input } from "@/shared/ui/atoms/Input";
import { TextLink } from "@/shared/ui/atoms/TextLink";
import { FormField } from "@/shared/ui/molecules/FormField";
import { InlineNotice } from "@/shared/ui/molecules/InlineNotice";
import { PasswordInput } from "@/shared/ui/molecules/PasswordInput";
import { useLogin } from "../hooks/useAuth";
import { AuthCard } from "./AuthCard";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const login = useLogin();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD, remember: true },
  });
  const { errors } = form.formState;
  const busy = login.isPending || login.isSuccess;

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
      <form
        onSubmit={form.handleSubmit((values) => login.mutate(values))}
        noValidate
        className="flex flex-col gap-4"
      >
        {login.isError && (
          <InlineNotice variant="error">{login.error.message}</InlineNotice>
        )}
        <FormField label="E-posta" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            readOnly={busy}
            invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <FormField label="Şifre" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            readOnly={busy}
            invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Checkbox label="Beni hatırla" {...form.register("remember")} />
          <TextLink href="/sifre-sifirlama" className="text-body">
            Şifremi unuttum
          </TextLink>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
          {login.isSuccess ? (
            <>
              <Check size={16} strokeWidth={2} aria-hidden /> Giriş yapıldı
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
        <Divider label="veya" />
        <GoogleButton label="Google ile giriş yap" />
      </form>
    </AuthCard>
  );
}
