import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { InvoicesTableClient } from "./invoices-table-client";

interface InvoicesTableProps {
  searchQuery?: string;
  isSuperAdmin: boolean;
}

async function getInvoicesWithItems(
  searchQuery?: string
): Promise<(Tables<"invoices"> & { items: Tables<"invoice_items">[] })[]> {
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(`
      *,
      items:invoice_items(*)
    `)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `invoice_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,vehicle_make.ilike.%${searchQuery}%,vehicle_model.ilike.%${searchQuery}%`
    );
  }

  const { data } = await query;
  
  // Transform the data to match expected type
  return (data || []).map((invoice) => ({
    ...invoice,
    items: invoice.items || [],
  }));
}

export async function InvoicesTable({
  searchQuery,
  isSuperAdmin,
}: InvoicesTableProps) {
  const invoices = await getInvoicesWithItems(searchQuery);
  const hasFilters = !!searchQuery;

  return (
    <InvoicesTableClient
      invoices={invoices}
      isSuperAdmin={isSuperAdmin}
      hasFilters={hasFilters}
    />
  );
}
