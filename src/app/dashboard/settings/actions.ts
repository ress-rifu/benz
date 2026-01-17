"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis/cache";
import { CACHE_KEYS } from "@/lib/redis/client";
import {
  invoiceSettingsSchema,
  type InvoiceSettingsInput,
} from "@/lib/validations/invoice";

export async function updateInvoiceSettings(
  id: string,
  input: InvoiceSettingsInput
) {
  try {
    await requireSuperAdmin();
    const parsed = invoiceSettingsSchema.safeParse(input);

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("invoice_settings")
      .update({
        logo_url: parsed.data.logo_url,
        header_text: parsed.data.header_text,
        footer_text: parsed.data.footer_text,
        primary_color: parsed.data.primary_color,
        secondary_color: parsed.data.secondary_color,
        show_logo: parsed.data.show_logo,
        show_header: parsed.data.show_header,
        show_footer: parsed.data.show_footer,
        show_vehicle_vin: parsed.data.show_vehicle_vin,
        show_vehicle_license: parsed.data.show_vehicle_license,
        show_customer_email: parsed.data.show_customer_email,
        show_customer_phone: parsed.data.show_customer_phone,
        show_customer_address: parsed.data.show_customer_address,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    await invalidateCache(CACHE_KEYS.INVOICE_SETTINGS);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    await requireSuperAdmin();

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF." };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "File size must be less than 2MB" };
    }

    const supabase = await createServiceClient();

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("invoice-assets")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return { error: "Failed to upload file" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("invoice-assets").getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (e) {
    console.error("Upload error:", e);
    return { error: e instanceof Error ? e.message : "An error occurred" };
  }
}

