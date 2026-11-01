"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiError } from "@/shared/api/http-client";
import { registerSchema, type RegisterInput } from "@/shared/contracts/auth";
import { showToast } from "@/shared/stores/toast";
import { Button } from "@/shared/ui/atoms/Button";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { Divider } from "@/shared/ui/atoms/Divider";
import { Input } from "@/shared/ui/atoms/Input";
import { TextLink } from "@/shared/ui/atoms/TextLink";
import { Tooltip } from "@/shared/ui/atoms/Tooltip";
import { FormField } from "@/shared/ui/molecules/FormField";
import { PasswordInput } from "@/shared/ui/molecules/PasswordInput";
import { useRegister } from "../hooks/useAuth";
import { AuthCard } from "./AuthCard";
import { GoogleButton } from "./GoogleButton";
import { PasswordStrength } from "./PasswordStrength";

export function RegisterForm() {
  const register = useRegister();
  const [accepted, setAccepted] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;
  const password = useWatch({ control: form.control, name: "password" });

  const button = (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={!accepted}
      loading={register.isPending}
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
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => {
          setEmailTaken(false);
          register.mutate(values, {
            onError: (error) => {
              if (error instanceof ApiError && error.code === "eposta-kayitli") {
                setEmailTaken(true);
              } else {
                showToast({ variant: "error", message: error.message });
              }
            },
          });
        })}
      >
        <FormField label="Ad Soyad" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
        </FormField>
        <FormField
          label="Çalışma e-postası"
          htmlFor="email"
          required
          error={
            emailTaken ? (
              <>
                Bu e-posta zaten kullanılıyor.{" "}
                <TextLink href="/giris">Giriş yapmayı dene.</TextLink>
              </>
            ) : (
              errors.email?.message
            )
          }
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email) || emailTaken}
            {...form.register("email")}
          />
        </FormField>
        <FormField
          label="Şifre"
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            {...form.register("password")}
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
