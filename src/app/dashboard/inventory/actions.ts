"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCachePattern, invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import {
  inventoryItemSchema,
  stockAdjustmentSchema,
  type InventoryItemInput,
  type StockAdjustmentInput,
} from "@/lib/validations/inventory";

export async function createInventoryItem(input: InventoryItemInput) {
  try {
    const user = await requireAdmin();
    const parsed = inventoryItemSchema.safeParse(input);

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const supabase = await createClient();

    // Check for duplicate SKU
    const { data: existing } = await supabase
      .from("inventory_items")
      .select("id")
      .eq("sku", parsed.data.sku)
      .single();

    if (existing) {
      return { error: "An item with this SKU already exists" };
    }

    const { data: item, error } = await supabase
      .from("inventory_items")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Log the initial stock
    if (parsed.data.quantity > 0) {
      await supabase.from("inventory_logs").insert({
        inventory_item_id: item.id,
        action: "add",
        quantity_change: parsed.data.quantity,
        previous_quantity: 0,
        new_quantity: parsed.data.quantity,
        reason: "Initial stock",
        user_id: user.id,
      });
    }

    await invalidateCache(CACHE_KEYS.INVENTORY);
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);
    revalidatePath("/dashboard/inventory");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function updateInventoryItem(
  id: string,
  input: InventoryItemInput
) {
  try {
    await requireAdmin();
    const parsed = inventoryItemSchema.safeParse(input);

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const supabase = await createClient();

    // Check for duplicate SKU (excluding current item)
    const { data: existing } = await supabase
      .from("inventory_items")
      .select("id")
      .eq("sku", parsed.data.sku)
      .neq("id", id)
      .single();

    if (existing) {
      return { error: "An item with this SKU already exists" };
    }

    const { error } = await supabase
      .from("inventory_items")
      .update({
        name: parsed.data.name,
        sku: parsed.data.sku,
        cost_price: parsed.data.cost_price,
        selling_price: parsed.data.selling_price,
        description: parsed.data.description,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await invalidateCache(CACHE_KEYS.INVENTORY);
    await invalidateCache(CACHE_KEYS.INVENTORY_ITEM(id));
    revalidatePath("/dashboard/inventory");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function adjustStock(input: StockAdjustmentInput) {
  try {
    const user = await requireAdmin();
    const parsed = stockAdjustmentSchema.safeParse(input);

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const supabase = await createClient();

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", parsed.data.inventory_item_id)
      .single();

    if (fetchError || !item) {
      return { error: "Item not found" };
    }

    let newQuantity: number;
    let quantityChange: number;

    switch (parsed.data.action) {
      case "add":
        newQuantity = item.quantity + parsed.data.quantity;
        quantityChange = parsed.data.quantity;
        break;
      case "remove":
        if (item.quantity < parsed.data.quantity) {
          return { error: "Insufficient stock" };
        }
        newQuantity = item.quantity - parsed.data.quantity;
        quantityChange = -parsed.data.quantity;
        break;
      case "adjust":
        newQuantity = parsed.data.quantity;
        quantityChange = parsed.data.quantity - item.quantity;
        break;
      default:
        return { error: "Invalid action" };
    }

    // Update quantity
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({ quantity: newQuantity })
      .eq("id", item.id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Create log entry
    await supabase.from("inventory_logs").insert({
      inventory_item_id: item.id,
      action: parsed.data.action,
      quantity_change: quantityChange,
      previous_quantity: item.quantity,
      new_quantity: newQuantity,
      reason: parsed.data.reason,
      user_id: user.id,
    });

    await invalidateCache(CACHE_KEYS.INVENTORY);
    await invalidateCache(CACHE_KEYS.INVENTORY_ITEM(item.id));
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);
    revalidatePath("/dashboard/inventory");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    await requireSuperAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await invalidateCache(CACHE_KEYS.INVENTORY);
    await invalidateCache(CACHE_KEYS.INVENTORY_ITEM(id));
    await invalidateCache(CACHE_KEYS.DASHBOARD_SUMMARY);
    revalidatePath("/dashboard/inventory");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

