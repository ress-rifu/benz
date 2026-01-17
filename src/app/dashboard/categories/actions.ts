"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import { z } from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    name_bn: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    is_active: z.boolean(),
});

type CategoryInput = z.infer<typeof categorySchema>;

// Service Categories
export async function getServiceCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");
    return data || [];
}

export async function createServiceCategory(input: CategoryInput) {
    try {
        await requireSuperAdmin();
        const parsed = categorySchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("service_categories")
            .insert(parsed.data);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICE_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function updateServiceCategory(id: string, input: CategoryInput) {
    try {
        await requireSuperAdmin();
        const parsed = categorySchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("service_categories")
            .update(parsed.data)
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICE_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function deleteServiceCategory(id: string) {
    try {
        await requireSuperAdmin();
        const supabase = await createClient();

        // Check if category has any associated services
        const { count } = await supabase
            .from("services")
            .select("*", { count: "exact", head: true })
            .eq("category_id", id);

        if (count && count > 0) {
            return { error: `Cannot delete category with ${count} associated services. Deactivate them first.` };
        }

        const { error } = await supabase
            .from("service_categories")
            .delete()
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.SERVICE_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/services");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

// Part Categories
export async function getPartCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("part_categories")
        .select("*")
        .order("name");
    return data || [];
}

export async function createPartCategory(input: CategoryInput) {
    try {
        await requireSuperAdmin();
        const parsed = categorySchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("part_categories")
            .insert(parsed.data);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PART_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function updatePartCategory(id: string, input: CategoryInput) {
    try {
        await requireSuperAdmin();
        const parsed = categorySchema.safeParse(input);

        if (!parsed.success) {
            return { error: "Invalid input" };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from("part_categories")
            .update(parsed.data)
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PART_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}

export async function deletePartCategory(id: string) {
    try {
        await requireSuperAdmin();
        const supabase = await createClient();

        // Check if category has any associated parts
        const { count } = await supabase
            .from("parts")
            .select("*", { count: "exact", head: true })
            .eq("category_id", id);

        if (count && count > 0) {
            return { error: `Cannot delete category with ${count} associated parts. Deactivate them first.` };
        }

        const { error } = await supabase
            .from("part_categories")
            .delete()
            .eq("id", id);

        if (error) {
            return { error: error.message };
        }

        await invalidateCache(CACHE_KEYS.PART_CATEGORIES);
        revalidatePath("/dashboard/categories");
        revalidatePath("/dashboard/parts");

        return { success: true };
    } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred" };
    }
}
