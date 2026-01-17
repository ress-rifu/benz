"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import {
    partSchema,
    partStockAdjustmentSchema,
    type PartInput,
    type PartStockAdjustmentInput,
} from "@/lib/validations/parts";

export async function getPartCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("part_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
    return data || [];
}

export async function getPartBrands() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("part_brands")
        .select("*")
        .eq("is_active", true)
        .order("name");
    return data || [];
}

export async function getPartsWithRelations() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("parts")
        .select(`
      *,
      part_categories (
        id,
        name,
        name_bn
      ),
      part_brands (
        id,
        name,
        country_of_origin
      )
    `)
        .order("name");
    return data || [];
}

export async function createPart(input: PartInput) {
    try {
        await requireSuperAdmin();
        const parsed = partSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        // Check for duplicate SKU
        const { data: existing } = await supabase
            .from("parts")
            .select("id")
            .eq("sku", parsed.data.sku)
            .single();

        if (existing) {
            return { error: "A part with this SKU already exists" };
        }

        const { error } = await supabase
            .from("parts")
            .insert(parsed.data);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PARTS);
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function updatePart(id: string, input: PartInput) {
    try {
        await requireSuperAdmin();
        const parsed = partSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        // Check for duplicate SKU (excluding current part)
        const { data: existing } = await supabase
            .from("parts")
            .select("id")
            .eq("sku", parsed.data.sku)
            .neq("id", id)
            .single();

        if (existing) {
            return { error: "A part with this SKU already exists" };
        }

        const { error } = await supabase
            .from("parts")
            .update({
                category_id: parsed.data.category_id,
                brand_id: parsed.data.brand_id,
                name: parsed.data.name,
                name_bn: parsed.data.name_bn,
                sku: parsed.data.sku,
                part_number: parsed.data.part_number,
                cost_price: parsed.data.cost_price,
                selling_price: parsed.data.selling_price,
                min_stock_level: parsed.data.min_stock_level,
                description: parsed.data.description,
                compatible_vehicles: parsed.data.compatible_vehicles,
                is_active: parsed.data.is_active,
            })
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PARTS);
        await invalidateCache(CACHE_KEYS.PART(id));
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function adjustPartStock(input: PartStockAdjustmentInput) {
    try {
        await requireSuperAdmin();
        const parsed = partStockAdjustmentSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        // Get current part
        const { data: part, error: fetchError } = await supabase
            .from("parts")
            .select("*")
            .eq("id", parsed.data.part_id)
            .single();

        if (fetchError || !part) {
            return { error: "Part not found" };
        }

        let newQuantity: number;

        switch (parsed.data.action) {
            case "add":
                newQuantity = part.quantity + parsed.data.quantity;
                break;
            case "remove":
                if (part.quantity < parsed.data.quantity) {
                    return { error: "Insufficient stock" };
                }
                newQuantity = part.quantity - parsed.data.quantity;
                break;
            case "adjust":
                newQuantity = parsed.data.quantity;
                break;
            default:
                return { error: "Invalid action" };
        }

        // Update quantity
        const { error: updateError } = await supabase
            .from("parts")
            .update({ quantity: newQuantity })
            .eq("id", part.id);

        if (updateError) {
            return { error: updateError.message };
        }

        await invalidateCache(CACHE_KEYS.PARTS);
        await invalidateCache(CACHE_KEYS.PART(part.id));
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function deletePart(id: string) {
    try {
        await requireSuperAdmin();
        const supabase = await createClient();

        const { error } = await supabase
            .from("parts")
            .delete()
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PARTS);
        await invalidateCache(CACHE_KEYS.PART(id));
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}
