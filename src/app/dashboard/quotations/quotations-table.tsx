import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { QuotationsTableClient } from "./quotations-table-client";

interface QuotationsTableProps {
  searchQuery?: string;
  isSuperAdmin: boolean;
}

async function getQuotationsWithItems(
  searchQuery?: string
): Promise<(Tables<"quotations"> & { items: Tables<"quotation_items">[] })[]> {
  const supabase = await createClient();

  let query = supabase
    .from("quotations")
    .select(`
      *,
      items:quotation_items(*)
    `)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `quotation_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,vehicle_make.ilike.%${searchQuery}%,vehicle_model.ilike.%${searchQuery}%`
    );
  }

  const { data } = await query;
  
  return (data || []).map((quotation) => ({
    ...quotation,
    items: quotation.items || [],
  }));
}

export async function QuotationsTable({
  searchQuery,
  isSuperAdmin,
}: QuotationsTableProps) {
  const quotations = await getQuotationsWithItems(searchQuery);
  const hasFilters = !!searchQuery;

  return (
    <QuotationsTableClient
      quotations={quotations}
      isSuperAdmin={isSuperAdmin}
      hasFilters={hasFilters}
    />
  );
}
