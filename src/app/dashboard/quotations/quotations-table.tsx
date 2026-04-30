import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { QuotationsTableClient } from "./quotations-table-client";

interface QuotationsTableProps {
  searchQuery?: string;
  isSuperAdmin: boolean;
  page: number;
  pageSize: number;
}

async function getQuotationsWithItems(
  searchQuery: string | undefined,
  from: number,
  to: number
): Promise<{
  rows: (Tables<"quotations"> & { items: Tables<"quotation_items">[] })[];
  total: number;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("quotations")
    .select(
      `
      *,
      items:quotation_items(*)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `quotation_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,vehicle_make.ilike.%${searchQuery}%,vehicle_model.ilike.%${searchQuery}%`
    );
  }

  const { data, count } = await query.range(from, to);

  const rows = (data || []).map((quotation) => ({
    ...quotation,
    items: quotation.items || [],
  }));

  return { rows, total: count || 0 };
}

export async function QuotationsTable({
  searchQuery,
  isSuperAdmin,
  page,
  pageSize,
}: QuotationsTableProps) {
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;
  const { rows: quotations, total } = await getQuotationsWithItems(searchQuery, from, to);
  const hasFilters = !!searchQuery;

  return (
    <QuotationsTableClient
      quotations={quotations}
      isSuperAdmin={isSuperAdmin}
      hasFilters={hasFilters}
      total={total}
      page={page}
      pageSize={pageSize}
    />
  );
}
