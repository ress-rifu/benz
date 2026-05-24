import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { SettingsContent } from "./settings-content";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<FormSkeleton fields={12} />}>
      <SettingsContent />
    </Suspense>
  );
}

