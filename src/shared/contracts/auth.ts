import { z } from "zod";
import { MIN_PASSWORD_SCORE, passwordRules, passwordScore } from "@/shared/domain/password";

const required = z.string().trim().min(1, "Bu alan zorunlu");

const email = z
  .string()
  .trim()
  .min(1, "Bu alan zorunlu")
  .email("Geçerli bir e-posta adresi gir.")
  .transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Bu alan zorunlu"),
  remember: z.boolean(),
});

export const registerSchema = z.object({
  name: required,
  email,
  password: z
    .string()
    .min(1, "Bu alan zorunlu")
    .refine((value) => passwordScore(value) >= MIN_PASSWORD_SCORE, "Daha güçlü bir şifre seç."),
});

export const passwordResetSchema = z.object({ email });

export const updateProfileSchema = z.object({
  name: required,
  username: required,
  timezone: required,
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Bu alan zorunlu"),
    next: z
      .string()
      .refine((value) => passwordScore(value) === passwordRules.length, "Şifre kurallarını karşılamıyor."),
    repeat: z.string(),
  })
  .refine((value) => value.next === value.repeat, {
    message: "Şifreler eşleşmiyor.",
    path: ["repeat"],
  });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type PasswordResetInput = z.input<typeof passwordResetSchema>;
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  current: boolean;
}
