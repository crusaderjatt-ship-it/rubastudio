"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="danger" className="w-full" type="button" onClick={logout}>
      Log out
    </Button>
  );
}
