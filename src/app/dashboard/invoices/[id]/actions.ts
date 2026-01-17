"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "paid" | "cancelled"
) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId);

    if (error) {
      return { error: error.message };
    }

    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

