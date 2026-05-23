import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/matches/filter")({
  component: FilterRedirect,
});

function FilterRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/matches", replace: true });
  }, [navigate]);
  return null;
}
