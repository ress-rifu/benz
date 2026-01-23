"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import type { InvoiceStatus } from "@/types/database";

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Get current invoice to verify status change is allowed
    const { data: currentInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select("status")
      .eq("id", invoiceId)
      .single();

    if (fetchError || !currentInvoice) {
      return { error: "Invoice not found" };
    }

    // Only allow changing from due to paid
    if (currentInvoice.status === "paid" && status === "due") {
      return { error: "Cannot change invoice status from Paid to Due" };
    }

    if (currentInvoice.status === status) {
      return { error: `Invoice is already ${status}` };
    }

    // Update invoice status
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Update invoice status error:", updateError);
      
      // Check if it's a column not found error (migration not run)
      if (updateError.message?.includes("column") || updateError.code === "42703") {
        return { error: "Database migration required. Please run: invoice_status_migration.sql" };
      }
      
      // Check if it's a trigger error
      if (updateError.message?.includes("immutable") || updateError.message?.includes("cannot be modified")) {
        return { error: "Invoice update blocked. Please check database triggers." };
      }
      
      return { error: `Failed to update invoice status: ${updateError.message || "Unknown error"}` };
    }

    // Invalidate caches since revenue calculations depend on status
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);

    // Revalidate paths
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (e) {
    console.error("Update invoice status error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}
