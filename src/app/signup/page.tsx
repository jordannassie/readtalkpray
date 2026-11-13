import type { Metadata } from "next";
import { LoginForm } from "../login/login-form";
import { safeAppReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = { title: "Create an account · Read Talk Pray" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeAppReturnPath(params.next ?? null) ?? "/app";
  return <LoginForm nextPath={nextPath} mode="signup" notice="" />;
}
