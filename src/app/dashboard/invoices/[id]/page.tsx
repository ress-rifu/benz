import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { InvoiceView } from "./invoice-view";
import { getUser } from "@/lib/auth/get-user";

interface InvoiceSettings {
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
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  header_image_url: string | null;
  show_header_image: boolean;
  footer_image_url: string | null;
  show_footer_image: boolean;
}

const DEFAULT_SETTINGS: InvoiceSettings = {
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
  margin_top: 10,
  margin_right: 10,
  margin_bottom: 10,
  margin_left: 10,
  header_image_url: null,
  show_header_image: true,
  footer_image_url: null,
  show_footer_image: true,
};

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [invoiceData, user] = await Promise.all([
    getInvoice(id),
    getUser(),
  ]);

  if (!user) {
    redirect("/login");
  }

  if (!invoiceData) {
    notFound();
  }

  const isSuperAdmin = user.role === "super_admin";

  // Use stored settings snapshot if available, otherwise use defaults
  // This ensures past invoices are displayed exactly as they were created
  const settings: InvoiceSettings = invoiceData.invoice.settings_snapshot
    ? (invoiceData.invoice.settings_snapshot as unknown as InvoiceSettings)
    : DEFAULT_SETTINGS;

  // Use stored billed_by_name for immutability
  const billedByName = invoiceData.invoice.billed_by_name || null;

  return (
    <Suspense fallback={<FormSkeleton fields={10} />}>
      <InvoiceView
        invoice={invoiceData.invoice}
        items={invoiceData.items}
        settings={settings}
        isSuperAdmin={isSuperAdmin}
        billedByName={billedByName}
      />
    </Suspense>
  );
}
