import { createClient } from "@/lib/supabase/server";
import { getOrSet } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
import { SettingsForm } from "./settings-form";
import type { Tables } from "@/types/database";

async function getInvoiceSettings(): Promise<Tables<"invoice_settings">> {
  const supabase = await createClient();

  return getOrSet(
    CACHE_KEYS.INVOICE_SETTINGS,
    async () => {
      const { data } = await supabase
        .from("invoice_settings")
        .select("*")
        .single();

      return (
        data || {
          id: "00000000-0000-0000-0000-000000000001",
          logo_url: null,
          header_text:
            "Thank you for choosing Benz Automobile for your vehicle service needs.",
          footer_text:
            "Payment is due within 30 days. Thank you for your business!",
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
          margin_top: 10,
          margin_right: 10,
          margin_bottom: 10,
          margin_left: 10,
          header_image_url: null,
          show_header_image: true,
          footer_image_url: null,
          show_footer_image: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );
    },
    CACHE_TTL.LONG
  );
}

export async function SettingsContent() {
  const settings = await getInvoiceSettings();

  return <SettingsForm settings={settings} />;
}

