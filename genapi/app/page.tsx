import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

