import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { InvoiceForm } from "./invoice-form";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

async function getParts(): Promise<Tables<"parts">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("parts")
    .select("*")
    .eq("is_active", true)
    .gt("quantity", 0)
    .order("name");
  return data || [];
}

async function getServices(): Promise<(Tables<"services"> & { category_name: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select(`
      *,
      service_categories (
        name
      )
    `)
    .eq("is_active", true)
    .order("name");

  return (data || []).map((service) => ({
    ...service,
    category_name: (service.service_categories as { name: string } | null)?.name || "Uncategorized",
  }));
}

async function getCustomers(): Promise<Tables<"customers">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return data || [];
}

export default async function NewInvoicePage() {
  const [parts, services, customers] = await Promise.all([
    getParts(),
    getServices(),
    getCustomers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
        <p className="text-slate-500">Create a new invoice for a customer</p>
      </div>

      <Suspense fallback={<FormSkeleton fields={10} />}>
        <InvoiceForm parts={parts} services={services} customers={customers} />
      </Suspense>
    </div>
  );
}


