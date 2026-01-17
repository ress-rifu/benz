"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database";

interface CreateAdminInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function createAdmin(input: CreateAdminInput) {
  try {
    await requireSuperAdmin();

    // Use admin client for admin operations (bypasses RLS)
    const supabase = createAdminClient();

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", input.username.toLowerCase())
      .single();

    if (existingUser) {
      return { error: "This username is already taken" };
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

    if (authError) {
      // Check for common errors
      if (authError.message.includes("already registered")) {
        return { error: "A user with this email already exists" };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user" };
    }

    // Create the user record in our users table
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: input.email,
      username: input.username.toLowerCase(),
      name: input.name,
      role: input.role,
    });

    if (dbError) {
      // Clean up auth user if db insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: dbError.message };
    }

    revalidatePath("/dashboard/admins");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function updateAdminRole(userId: string, role: UserRole) {
  try {
    const currentUser = await requireSuperAdmin();

    // Prevent changing own role
    if (currentUser.id === userId) {
      return { error: "You cannot change your own role" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/admins");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function deleteAdmin(userId: string) {
  try {
    const currentUser = await requireSuperAdmin();

    // Prevent deleting self
    if (currentUser.id === userId) {
      return { error: "You cannot delete your own account" };
    }

    // Use admin client for admin operations (bypasses RLS)
    const supabase = createAdminClient();

    // Check if user has any invoices (invoices are immutable, so we can't transfer them)
    const { data: userInvoices, error: invoiceCheckError } = await supabase
      .from("invoices")
      .select("id")
      .eq("created_by", userId)
      .limit(1);

    if (invoiceCheckError) {
      console.error("Failed to check user invoices:", invoiceCheckError);
      return { error: "Failed to check user's invoices" };
    }

    if (userInvoices && userInvoices.length > 0) {
      return { 
        error: "Cannot delete this admin because they have created invoices. Invoices are permanent records and cannot be transferred or deleted." 
      };
    }

    // Transfer part stock logs to the current super admin
    const { error: logTransferError } = await supabase
      .from("part_stock_logs")
      .update({ user_id: currentUser.id })
      .eq("user_id", userId);

    if (logTransferError) {
      console.error("Failed to transfer part stock logs:", logTransferError);
      return { error: "Failed to transfer user's part stock logs" };
    }

    // Delete from users table first
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Failed to delete user from database:", dbError);
      return { error: `Failed to delete user: ${dbError.message}` };
    }

    // Then delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      // User record is already deleted, so we just log this
    }

    revalidatePath("/dashboard/admins");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/parts");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}
