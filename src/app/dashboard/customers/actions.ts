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

export async function getCustomers(searchQuery?: string) {
    const supabase = await createClient();
    
    // Get customers with their invoice totals
    let query = supabase
        .from("customers")
        .select("*")
        .order("name");
    
    if (searchQuery) {
        query = query.or(
            `name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );
    }
    
    const { data: customers } = await query;
    
    if (!customers) return [];
    
    // Get invoice totals for each customer (only due invoices)
    const { data: invoices } = await supabase
        .from("invoices")
        .select("customer_name, total, status");
    
    // Calculate total due per customer
    const customerFinancials = customers.map(customer => {
        const customerInvoices = invoices?.filter(
            inv => inv.customer_name.toLowerCase() === customer.name.toLowerCase()
        ) || [];
        
        const totalDue = customerInvoices
            .filter(inv => inv.status === "due")
            .reduce((sum, inv) => sum + Number(inv.total), 0);
        
        const totalPaid = customerInvoices
            .filter(inv => inv.status === "paid")
            .reduce((sum, inv) => sum + Number(inv.total), 0);
        
        return {
            ...customer,
            total_due: totalDue,
            total_paid: totalPaid,
            has_outstanding: totalDue > 0,
        };
    });
    
    return customerFinancials;
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
