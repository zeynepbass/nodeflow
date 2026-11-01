import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/shared/api/query-keys";
import type { UserProfile } from "@/shared/domain/types";
import { authApi } from "../api/auth-api";

export function useCurrentUser() {
  const { data } = useQuery({ queryKey: queryKeys.session, queryFn: authApi.me });
  return data as UserProfile;
}

function useEnterWorkspace() {
  const client = useQueryClient();
  const router = useRouter();
  return (user: UserProfile) => {
    client.clear();
    client.setQueryData(queryKeys.session, user);
    router.push("/panel");
    router.refresh();
  };
}

export function useLogin() {
  const enter = useEnterWorkspace();
  return useMutation({
    mutationFn: authApi.login,
    meta: { silent: true },
    onSuccess: enter,
  });
}

export function useRegister() {
  const enter = useEnterWorkspace();
  return useMutation({
    mutationFn: authApi.register,
    meta: { silent: true },
    onSuccess: enter,
  });
}

function useLeaveWorkspace() {
  const client = useQueryClient();
  const router = useRouter();
  return () => {
    client.removeQueries({
      predicate: ({ queryKey }) => queryKey[0] !== queryKeys.session[0],
    });
    router.push("/giris");
    router.refresh();
  };
}

export function useLogout() {
  const leave = useLeaveWorkspace();
  return useMutation({ mutationFn: authApi.logout, onSuccess: leave });
}

export function useDeleteAccount() {
  const leave = useLeaveWorkspace();
  return useMutation({ mutationFn: authApi.deleteAccount, onSuccess: leave });
}

export function usePasswordReset() {
  return useMutation({ mutationFn: authApi.requestReset });
}

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => client.setQueryData(queryKeys.session, user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    meta: { silent: true },
  });
}

export function useSessions() {
  return useQuery({ queryKey: queryKeys.sessions, queryFn: authApi.sessions });
}

export function useEndSession() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.endSession,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.sessions }),
  });
}
