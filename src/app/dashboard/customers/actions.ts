"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import {
    customerSchema,
    type CustomerInput,
} from "@/lib/validations/customers";

export async function getCustomers() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("customers")
        .select("*")
        .order("name");
    return data || [];
}

export async function getActiveCustomers() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("is_active", true)
        .order("name");
    return data || [];
}

export async function createCustomer(input: CustomerInput) {
    try {
        await requireAdmin();
        const parsed = customerSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        // Clean up empty email
        const dataToInsert = {
            ...parsed.data,
            email: parsed.data.email || null,
        };

        const { data, error } = await supabase
            .from("customers")
            .insert(dataToInsert)
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.CUSTOMERS);
        revalidatePath("/dashboard/customers");

        return { success: true, customer: data };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function updateCustomer(id: string, input: CustomerInput) {
    try {
        await requireAdmin();
        const parsed = customerSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        // Clean up empty email
        const dataToUpdate = {
            ...parsed.data,
            email: parsed.data.email || null,
        };

        const { error } = await supabase
            .from("customers")
            .update(dataToUpdate)
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.CUSTOMERS);
        await invalidateCache(CACHE_KEYS.CUSTOMER(id));
        revalidatePath("/dashboard/customers");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function deleteCustomer(id: string) {
    try {
        await requireSuperAdmin();
        const supabase = await createClient();

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.CUSTOMERS);
        await invalidateCache(CACHE_KEYS.CUSTOMER(id));
        revalidatePath("/dashboard/customers");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}
