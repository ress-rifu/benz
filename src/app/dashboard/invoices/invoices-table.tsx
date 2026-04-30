import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { InvoicesTableClient } from "./invoices-table-client";

interface InvoicesTableProps {
  searchQuery?: string;
  isSuperAdmin: boolean;
  page: number;
  pageSize: number;
}

async function getInvoicesWithItems(
  searchQuery: string | undefined,
  from: number,
  to: number
): Promise<{
  rows: (Tables<"invoices"> & { items: Tables<"invoice_items">[] })[];
  total: number;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(
      `
      *,
      items:invoice_items(*)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `invoice_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,vehicle_make.ilike.%${searchQuery}%,vehicle_model.ilike.%${searchQuery}%`
    );
  }

  const { data, count } = await query.range(from, to);

  const rows = (data || []).map((invoice) => ({
    ...invoice,
    items: invoice.items || [],
  }));

  return { rows, total: count || 0 };
}

export async function InvoicesTable({
  searchQuery,
  isSuperAdmin,
  page,
  pageSize,
}: InvoicesTableProps) {
  const from = (page - 1) * pageSize;
  const to = page * pageSize - 1;
  const { rows: invoices, total } = await getInvoicesWithItems(searchQuery, from, to);
  const hasFilters = !!searchQuery;

  return (
    <InvoicesTableClient
      invoices={invoices}
      isSuperAdmin={isSuperAdmin}
      hasFilters={hasFilters}
      total={total}
      page={page}
      pageSize={pageSize}
    />
  );
}
