import type {
  ChangePasswordInput,
  LoginInput,
  PasswordResetInput,
  RegisterInput,
  SessionInfo,
  UpdateProfileInput,
} from "@/shared/contracts/auth";
import type { UserProfile } from "@/shared/domain/types";
import { http } from "@/shared/api/http-client";

export const authApi = {
  me: () => http.get<UserProfile>("/api/auth/me"),
  login: (input: LoginInput) => http.post<UserProfile>("/api/auth/login", input),
  register: (input: RegisterInput) => http.post<UserProfile>("/api/auth/register", input),
  logout: () => http.post<void>("/api/auth/logout"),
  requestReset: (input: PasswordResetInput) =>
    http.post<void>("/api/auth/password-reset", input),
  updateProfile: (input: UpdateProfileInput) =>
    http.patch<UserProfile>("/api/auth/me", input),
  changePassword: (input: ChangePasswordInput) =>
    http.post<void>("/api/auth/password", input),
  sessions: () => http.get<SessionInfo[]>("/api/auth/sessions"),
  endSession: (id: string) => http.delete(`/api/auth/sessions/${id}`),
  deleteAccount: () => http.delete("/api/auth/me"),
};
