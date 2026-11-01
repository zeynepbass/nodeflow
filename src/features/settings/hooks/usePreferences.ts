import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/api/http-client";
import { queryKeys } from "@/shared/api/query-keys";
import type { Preferences, UpdatePreferencesInput } from "@/shared/contracts/preferences";

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: () => http.get<Preferences>("/api/preferences"),
  });
}

export function useUpdatePreferences() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdatePreferencesInput) =>
      http.patch<Preferences>("/api/preferences", patch),
    onMutate: async (patch) => {
      await client.cancelQueries({ queryKey: queryKeys.preferences });
      const previous = client.getQueryData<Preferences>(queryKeys.preferences);
      if (previous) {
        client.setQueryData<Preferences>(queryKeys.preferences, {
          twoFactor: patch.twoFactor ?? previous.twoFactor,
          notifications: { ...previous.notifications, ...patch.notifications },
        });
      }
      return { previous };
    },
    onError: (_error, _patch, context) =>
      client.setQueryData(queryKeys.preferences, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.preferences }),
  });
}
