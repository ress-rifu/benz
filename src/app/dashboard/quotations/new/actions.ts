"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { quotationSchema, type QuotationInput } from "@/lib/validations/quotation";
import { generateQuotationNumber } from "@/lib/utils";

async function getInvoiceSettings(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("invoice_settings")
    .select("*")
    .single();

  return data || {
    logo_url: null,
    header_text: "Thank you for choosing Benz Automobile for your vehicle service needs.",
    footer_text: "Payment is due within 30 days. Thank you for your business!",
    primary_color: "#1f2937",
    secondary_color: "#4b5563",
    show_logo: true,
    show_header: true,
    show_footer: true,
    show_vehicle_vin: true,
    show_vehicle_license: true,
    show_customer_email: true,
    show_customer_phone: true,
    show_customer_address: true,
  };
}

export async function createQuotation(input: QuotationInput) {
  try {
    const user = await requireAdmin();
    const parsed = quotationSchema.safeParse(input);

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.issues);
      return { error: "Invalid input: " + parsed.error.issues[0]?.message };
    }

    const supabase = await createClient();

    // Fetch current settings to snapshot
    const settings = await getInvoiceSettings(supabase);
    const data = parsed.data;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxAmount = subtotal * (data.tax_rate / 100);
    const total = subtotal + taxAmount - data.discount_amount;

    // Create quotation
    const quotationNumber = generateQuotationNumber();

    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        quotation_number: quotationNumber,
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
        created_by: user.id,
        created_by_name: user.name || null,
        settings_snapshot: settings,
      })
      .select()
      .single();

    if (quotationError || !quotation) {
      return { error: quotationError?.message || "Failed to create quotation" };
    }

    // Create quotation items (no stock deduction for quotations)
    const quotationItems = data.items.map((item) => ({
      quotation_id: quotation.id,
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
      // Rollback quotation creation
      await supabase.from("quotations").delete().eq("id", quotation.id);
      return { error: "Failed to create quotation items" };
    }

    revalidatePath("/dashboard/quotations");

    return { success: true, quotationId: quotation.id };
  } catch (e) {
    console.error("Create quotation error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}
