"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "./useUser";
import { api } from "@/lib/api";

const TOTP_WINDOW_MS = 5 * 60 * 1000; // must match backend

export function useTotpSession() {
  const { user, mutate } = useUser();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const verifiedAt = (user as any)?.totpVerifiedAt;
    if (!verifiedAt) { setSecondsLeft(0); return; }

    function tick() {
      const elapsed   = Date.now() - new Date(verifiedAt).getTime();
      const remaining = Math.max(0, TOTP_WINDOW_MS - elapsed);
      setSecondsLeft(Math.floor(remaining / 1000));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [(user as any)?.totpVerifiedAt]);

  const isValid = secondsLeft > 0;

  const refresh = useCallback(async (token: string): Promise<void> => {
    await api.totp.reauth(token);
    await mutate(
      async (current) => ({
        ...current!,
        totpVerifiedAt: new Date().toISOString(),
      }),
      { revalidate: true }
    );
  }, [mutate]);

  return { secondsLeft, isValid, refresh };
}