import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { InvoiceView } from "./invoice-view";
import { getOrSet } from "@/lib/redis/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis/client";
import type { Tables } from "@/types/database";

interface InvoiceSettings {
  id: string;
  logo_url: string | null;
  header_text: string | null;
  footer_text: string | null;
  primary_color: string;
  secondary_color: string;
  show_logo: boolean;
  show_header: boolean;
  show_footer: boolean;
  show_vehicle_vin: boolean;
  show_vehicle_license: boolean;
  show_customer_email: boolean;
  show_customer_phone: boolean;
  show_customer_address: boolean;
}

async function getInvoice(id: string) {
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) {
    return null;
  }

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at");

  return { invoice, items: items || [] };
}

async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const supabase = await createClient();

  return getOrSet(
    CACHE_KEYS.INVOICE_SETTINGS,
    async () => {
      const { data } = await supabase
        .from("invoice_settings")
        .select("*")
        .single();

      return data || {
        id: "",
        logo_url: null,
        header_text: "Thank you for choosing Benz Automobile for your vehicle service needs.",
        footer_text: "Payment is due within 30 days. Thank you for your business!",
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
      };
    },
    CACHE_TTL.LONG
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [invoiceData, settings] = await Promise.all([
    getInvoice(id),
    getInvoiceSettings(),
  ]);

  if (!invoiceData) {
    notFound();
  }

  return (
    <Suspense fallback={<FormSkeleton fields={10} />}>
      <InvoiceView
        invoice={invoiceData.invoice}
        items={invoiceData.items}
        settings={settings}
      />
    </Suspense>
  );
}

