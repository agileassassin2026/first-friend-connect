import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/ff/SignUpForm";

export const Route = createFileRoute("/signup/senior-buddy")({
  component: () => <SignUpForm role="senior-buddy" />,
  head: () => ({ meta: [{ title: "Senior Buddy Sign Up | First Friend" }] }),
});
