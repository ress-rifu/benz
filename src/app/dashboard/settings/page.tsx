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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Customize invoice appearance and settings</p>
      </div>

      <Suspense fallback={<FormSkeleton fields={12} />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

