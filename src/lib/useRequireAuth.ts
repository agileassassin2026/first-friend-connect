import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getUser } from "@/lib/auth";

export function useRequireAuth(redirectTo = "/login") {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getUser()) navigate({ to: redirectTo });
    else setReady(true);
  }, [navigate, redirectTo]);
  return ready;
}
