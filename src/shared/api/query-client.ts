import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { showToast } from "@/shared/stores/toast";
import { ApiError } from "./http-client";

export function createQueryClient(onSessionExpired: () => void) {
  const redirectIfExpired = (error: unknown) => {
    const expired =
      error instanceof ApiError && error.status === 401 && error.code === "yetkisiz";
    if (expired) onSessionExpired();
    return expired;
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectIfExpired }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _result, mutation) => {
        if (redirectIfExpired(error) || mutation.meta?.silent) return;
        showToast({ variant: "error", message: error.message });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, error) =>
          count < 2 &&
          !(error instanceof ApiError && error.status < 500 && error.status > 0),
      },
    },
  });
}
