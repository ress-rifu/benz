import { Suspense } from "react";
import { FormSkeleton } from "@/components/skeletons/form-skeleton";
import { EditQuotationForm } from "./edit-quotation-form";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import type { Tables } from "@/types/database";

async function getQuotation(id: string) {
  const supabase = await createClient();

  const { data: quotation } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (!quotation) {
    return null;
  }

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("created_at");

  return { quotation, items: items || [] };
}

async function getParts(): Promise<Tables<"parts">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("parts")
    .select("*")
    .eq("is_active", true)
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationPage({ params }: PageProps) {
  const { id } = await params;
  const [quotationData, user, parts, services, customers] = await Promise.all([
    getQuotation(id),
    getUser(),
    getParts(),
    getServices(),
    getCustomers(),
  ]);

  if (!user) {
    redirect("/login");
  }

  if (!quotationData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Edit Quotation {quotationData.quotation.quotation_number}
        </h1>
        <p className="text-sm text-slate-500">Update the quotation details</p>
      </div>

      <Suspense fallback={<FormSkeleton fields={10} />}>
        <EditQuotationForm
          quotation={quotationData.quotation}
          existingItems={quotationData.items}
          parts={parts}
          services={services}
          customers={customers}
        />
      </Suspense>
    </div>
  );
}
