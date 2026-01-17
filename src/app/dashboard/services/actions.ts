"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import {
    serviceSchema,
    type ServiceInput,
} from "@/lib/validations/services";

export async function getServiceCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
    return data || [];
}

export async function getServicesWithCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("services")
        .select(`
      *,
      service_categories (
        id,
        name,
        name_bn
      )
    `)
        .order("name");
    return data || [];
}

export async function createService(input: ServiceInput) {
    try {
        await requireSuperAdmin();
        const parsed = serviceSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("services")
            .insert(parsed.data);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICES);
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function updateService(id: string, input: ServiceInput) {
    try {
        await requireSuperAdmin();
        const parsed = serviceSchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("services")
            .update(parsed.data)
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICES);
        await invalidateCache(CACHE_KEYS.SERVICE(id));
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function deleteService(id: string) {
    try {
        await requireSuperAdmin();
        const supabase = await createClient();

        const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICES);
        await invalidateCache(CACHE_KEYS.SERVICE(id));
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}
