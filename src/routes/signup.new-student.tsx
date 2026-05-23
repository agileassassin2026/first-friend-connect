import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/ff/SignUpForm";

export const Route = createFileRoute("/signup/new-student")({
  component: () => <SignUpForm role="new-student" />,
  head: () => ({ meta: [{ title: "New Student Sign Up | First Friend" }] }),
});
