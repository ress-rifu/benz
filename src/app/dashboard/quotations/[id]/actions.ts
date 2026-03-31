"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

export async function deleteQuotation(quotationId: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Delete quotation items first (cascade should handle it, but be explicit)
    await supabase
      .from("quotation_items")
      .delete()
      .eq("quotation_id", quotationId);

    // Delete quotation
    const { error } = await supabase
      .from("quotations")
      .delete()
      .eq("id", quotationId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/quotations");

    return { success: true };
  } catch (e) {
    console.error("Delete quotation error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}
