
import PhoneAuthForm from "@/components/phone-auth-form";
import { auth } from "@/server/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect("/dashboard")
  }
  return <PhoneAuthForm />;
}
