"use client";
import useSWR from "swr";
import { api } from "@/lib/api";
import { User } from "@/types";

interface MeResponse extends User {
  projects: { id: string; name: string; currentLevel: number; visibility: string; status: string }[];
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>(
    "/users/me",
    () => api.get("/users/me"),
    { revalidateOnFocus: false }
  );
  return { user: data, error, isLoading, mutate };
}