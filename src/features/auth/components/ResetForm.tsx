"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { passwordResetSchema, type PasswordResetInput } from "@/shared/contracts/auth";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { TextLink } from "@/shared/ui/atoms/TextLink";
import { FormField } from "@/shared/ui/molecules/FormField";
import { InlineNotice } from "@/shared/ui/molecules/InlineNotice";
import { usePasswordReset } from "../hooks/useAuth";
import { AuthCard } from "./AuthCard";

export function ResetForm() {
  const reset = usePasswordReset();
  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: "" },
  });
  const { errors } = form.formState;

  return (
    <AuthCard
      title="Şifreni sıfırla"
      description="Hesabının e-posta adresini yaz, sıfırlama adımlarını iletelim."
      footer={<TextLink href="/giris">Girişe dön</TextLink>}
    >
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => reset.mutate(values))}
      >
        {reset.isSuccess && (
          <InlineNotice variant="success">
            Bu örnek sürümde e-posta gönderilmez; gerçek sürümde sıfırlama bağlantısı bu
            adrese iletilir.
          </InlineNotice>
        )}
        <FormField label="E-posta" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
          Sıfırlama Bağlantısı Gönder
        </Button>
      </form>
    </AuthCard>
  );
}
