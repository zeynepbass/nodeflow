"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { TextLink } from "@/components/atoms/TextLink";
import { FormField } from "@/components/molecules/FormField";
import { InlineNotice } from "@/components/molecules/InlineNotice";
import { AuthCard } from "@/components/organisms/AuthCard";

export function ResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    setError(undefined);
    setSent(true);
  };

  return (
    <AuthCard
      title="Şifreni sıfırla"
      description="Hesabının e-posta adresini yaz, sıfırlama adımlarını iletelim."
      footer={<TextLink href="/giris">Girişe dön</TextLink>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {sent && (
          <InlineNotice variant="success">
            Bu örnek sürümde e-posta gönderilmez; gerçek sürümde sıfırlama
            bağlantısı bu adrese iletilir.
          </InlineNotice>
        )}
        <FormField label="E-posta" htmlFor="email" error={error}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            invalid={Boolean(error)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full">
          Sıfırlama Bağlantısı Gönder
        </Button>
      </form>
    </AuthCard>
  );
}
