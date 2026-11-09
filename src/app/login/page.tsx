import { LoginForm } from "./login-form";
import { safeLeadsReturnPath } from "@/lib/auth/return-path";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeLeadsReturnPath(params.next ?? null);

  return (
    <LoginForm
      nextPath={nextPath ?? "/leader"}
      googleError={params.error === "google"}
    />
  );
}
