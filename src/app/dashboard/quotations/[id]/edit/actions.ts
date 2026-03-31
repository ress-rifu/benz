"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { quotationSchema, type QuotationInput } from "@/lib/validations/quotation";

export async function updateQuotation(quotationId: string, input: QuotationInput) {
  try {
    const user = await requireAdmin();
    const parsed = quotationSchema.safeParse(input);

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.issues);
      return { error: "Invalid input: " + parsed.error.issues[0]?.message };
    }

    const supabase = await createClient();
    const data = parsed.data;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxAmount = subtotal * (data.tax_rate / 100);
    const total = subtotal + taxAmount - data.discount_amount;

    // Update quotation
    const { error: quotationError } = await supabase
      .from("quotations")
      .update({
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year || null,
        vehicle_vin: data.vehicle_vin || null,
        vehicle_license_plate: data.vehicle_license_plate || null,
        vehicle_mileage: data.vehicle_mileage || null,
        driver_name: data.driver_name || null,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        discount_amount: data.discount_amount,
        total,
        notes: data.notes || null,
      })
      .eq("id", quotationId);

    if (quotationError) {
      return { error: quotationError.message || "Failed to update quotation" };
    }

    // Delete existing items and re-insert
    const { error: deleteError } = await supabase
      .from("quotation_items")
      .delete()
      .eq("quotation_id", quotationId);

    if (deleteError) {
      return { error: "Failed to update quotation items" };
    }

    // Create new quotation items
    const quotationItems = data.items.map((item) => ({
      quotation_id: quotationId,
      type: item.type,
      part_id: item.part_id || null,
      description: item.description,
      quantity: item.type === "service" ? 1 : item.quantity,
      unit_price: item.unit_price,
      total: (item.type === "service" ? 1 : item.quantity) * item.unit_price,
      part_model: item.type === "part" ? (item.part_model || null) : null,
      part_serial: item.type === "part" ? (item.part_serial || null) : null,
    }));

    const { error: itemsError } = await supabase
      .from("quotation_items")
      .insert(quotationItems);

    if (itemsError) {
      return { error: "Failed to create quotation items" };
    }

    revalidatePath("/dashboard/quotations");
    revalidatePath(`/dashboard/quotations/${quotationId}`);

    return { success: true };
  } catch (e) {
    console.error("Update quotation error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}
