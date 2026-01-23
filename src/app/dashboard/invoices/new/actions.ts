"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations/invoice";
import { generateInvoiceNumber } from "@/lib/utils";

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

export async function createInvoice(input: InvoiceInput) {
  try {
    const user = await requireAdmin();
    const parsed = invoiceSchema.safeParse(input);

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.issues);
      return { error: "Invalid input: " + parsed.error.issues[0]?.message };
    }

    const supabase = await createClient();

    // Fetch current settings to snapshot
    const settings = await getInvoiceSettings(supabase);
    const data = parsed.data;

    // Validate stock availability for parts
    const partItems = data.items.filter(
      (item) => item.type === "part" && item.part_id
    );

    if (partItems.length > 0) {
      const partIds = partItems.map((p) => p.part_id!);
      const { data: partsData } = await supabase
        .from("parts")
        .select("id, name, quantity")
        .in("id", partIds);

      for (const partItem of partItems) {
        const part = partsData?.find(
          (p) => p.id === partItem.part_id
        );

        if (!part) {
          return { error: `Part not found: ${partItem.description}` };
        }

        if (part.quantity < partItem.quantity) {
          return {
            error: `Insufficient stock for ${part.name}. Available: ${part.quantity}, Requested: ${partItem.quantity}`,
          };
        }
      }
    }

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxAmount = subtotal * (data.tax_rate / 100);
    const total = subtotal + taxAmount - data.discount_amount;

    // Create invoice
    const invoiceNumber = generateInvoiceNumber();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        customer_address: data.customer_address || null,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year || null,
        vehicle_vin: data.vehicle_vin || null,
        vehicle_license_plate: data.vehicle_license_plate || null,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        discount_amount: data.discount_amount,
        total,
        notes: data.notes || null,
        status: data.status,
        created_by: user.id,
        billed_by_name: user.name || null,
        settings_snapshot: settings,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      return { error: invoiceError?.message || "Failed to create invoice" };
    }

    // Create invoice items
    const invoiceItems = data.items.map((item) => ({
      invoice_id: invoice.id,
      type: item.type,
      part_id: item.part_id || null,
      description: item.description,
      quantity: item.type === "service" ? 1 : item.quantity, // Services always qty 1
      unit_price: item.unit_price,
      total: (item.type === "service" ? 1 : item.quantity) * item.unit_price,
      part_model: item.type === "part" ? (item.part_model || null) : null,
      part_serial: item.type === "part" ? (item.part_serial || null) : null,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      // Rollback invoice creation
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return { error: "Failed to create invoice items" };
    }

    // Deduct stock for parts (transaction-safe)
    for (const partItem of partItems) {
      // Get current quantity from parts table
      const { data: currentPart } = await supabase
        .from("parts")
        .select("quantity")
        .eq("id", partItem.part_id!)
        .single();

      if (!currentPart) continue;

      const newQuantity = currentPart.quantity - partItem.quantity;

      // Update parts quantity
      const { error: updateError } = await supabase
        .from("parts")
        .update({ quantity: newQuantity })
        .eq("id", partItem.part_id!);

      if (updateError) {
        console.error("Failed to update part quantity:", updateError);
        continue;
      }

      // Create part stock log
      await supabase.from("part_stock_logs").insert({
        part_id: partItem.part_id!,
        action: "invoice_deduct",
        quantity_change: -partItem.quantity,
        previous_quantity: currentPart.quantity,
        new_quantity: newQuantity,
        reason: `Deducted for invoice ${invoiceNumber}`,
        user_id: user.id,
        invoice_id: invoice.id,
      });
    }

    // Invalidate caches
    await invalidateCache(CACHE_KEYS.PARTS);
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/parts");
    revalidatePath("/dashboard");

    return { success: true, invoiceId: invoice.id };
  } catch (e) {
    console.error("Create invoice error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

