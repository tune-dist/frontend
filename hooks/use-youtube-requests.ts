"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/get-error-message";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import { getYouTubeRequests } from "@/lib/api/youtube-service";
import { queryKeys } from "@/lib/query-keys";

export function useYouTubeRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?._id ?? "";

  const query = useQuery({
    queryKey: queryKeys.youtube.requests(userId),
    queryFn: getYouTubeRequests,
    enabled: !!userId,
  });

  useEffect(() => {
    if (query.isError && !isPlanInactiveError(query.error)) {
      toast.error(getErrorMessage(query.error, "Failed to fetch YouTube requests"));
      console.error(query.error);
    }
  }, [query.isError, query.error]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.youtube.requests(userId) });

  return {
    requests: query.data ?? [],
    loading: !!userId && query.isPending,
    isFetching: query.isFetching,
    refetch: query.refetch,
    invalidate,
  };
}
