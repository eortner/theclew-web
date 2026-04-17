"use client";
import useSWR from "swr";
import { api } from "@/lib/api";
import { User } from "@/types";

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<{ user: User; projects: unknown[] }>(
    "/users/me",
    () => api.get("/users/me"),
    { revalidateOnFocus: false }
  );
  return { user: data, error, isLoading, mutate };
}
