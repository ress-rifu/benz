"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations/invoice";
import { generateInvoiceNumber } from "@/lib/utils";

export async function createInvoice(input: InvoiceInput) {
  try {
    const user = await requireAdmin();
    const parsed = invoiceSchema.safeParse(input);

    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.issues);
      return { error: "Invalid input: " + parsed.error.issues[0]?.message };
    }

    const supabase = await createClient();
    const data = parsed.data;

    // Validate stock availability for parts
    const partItems = data.items.filter(
      (item) => item.type === "part" && item.inventory_item_id
    );

    if (partItems.length > 0) {
      const partIds = partItems.map((p) => p.inventory_item_id!);
      const { data: inventoryData } = await supabase
        .from("inventory_items")
        .select("id, name, quantity")
        .in("id", partIds);

      for (const partItem of partItems) {
        const inventory = inventoryData?.find(
          (inv) => inv.id === partItem.inventory_item_id
        );

        if (!inventory) {
          return { error: `Part not found: ${partItem.description}` };
        }

        if (inventory.quantity < partItem.quantity) {
          return {
            error: `Insufficient stock for ${inventory.name}. Available: ${inventory.quantity}, Requested: ${partItem.quantity}`,
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
        status: "pending",
        created_by: user.id,
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
      inventory_item_id: item.inventory_item_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      // Rollback invoice creation
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return { error: "Failed to create invoice items" };
    }

    // Deduct inventory for parts (transaction-safe)
    for (const partItem of partItems) {
      // Get current quantity
      const { data: currentInventory } = await supabase
        .from("inventory_items")
        .select("quantity")
        .eq("id", partItem.inventory_item_id!)
        .single();

      if (!currentInventory) continue;

      const newQuantity = currentInventory.quantity - partItem.quantity;

      // Update inventory
      const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ quantity: newQuantity })
        .eq("id", partItem.inventory_item_id!);

      if (updateError) {
        console.error("Failed to update inventory:", updateError);
        continue;
      }

      // Create inventory log
      await supabase.from("inventory_logs").insert({
        inventory_item_id: partItem.inventory_item_id!,
        action: "invoice_deduct",
        quantity_change: -partItem.quantity,
        previous_quantity: currentInventory.quantity,
        new_quantity: newQuantity,
        reason: `Deducted for invoice ${invoiceNumber}`,
        user_id: user.id,
        invoice_id: invoice.id,
      });
    }

    // Invalidate caches
    await invalidateCache(CACHE_KEYS.INVENTORY);
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return { success: true, invoiceId: invoice.id };
  } catch (e) {
    console.error("Create invoice error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

