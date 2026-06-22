"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getYouTubeRequests } from "@/lib/api/youtube-service";
import { queryKeys } from "@/lib/query-keys";

export function useYouTubeRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.youtube.requests(),
    queryFn: getYouTubeRequests,
    enabled: !!user,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch YouTube requests");
      console.error(query.error);
    }
  }, [query.isError, query.error]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.youtube.requests() });

  return {
    requests: query.data ?? [],
    loading: !!user && query.isPending,
    isFetching: query.isFetching,
    refetch: query.refetch,
    invalidate,
  };
}
