import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, FileX } from "lucide-react";
import Link from "next/link";
import type { Tables } from "@/types/database";

interface InvoicesTableProps {
  searchQuery?: string;
  statusFilter?: string;
  isSuperAdmin: boolean;
}

async function getInvoices(searchQuery?: string, statusFilter?: string): Promise<Tables<"invoices">[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.or(
      `invoice_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,vehicle_make.ilike.%${searchQuery}%,vehicle_model.ilike.%${searchQuery}%`
    );
  }

  const { data } = await query;
  return data || [];
}

const statusColors = {
  draft: "secondary",
  pending: "outline",
  paid: "default",
  cancelled: "destructive",
} as const;

export async function InvoicesTable({ searchQuery, statusFilter, isSuperAdmin }: InvoicesTableProps) {
  const invoices = await getInvoices(searchQuery, statusFilter);

  if (invoices.length === 0) {
    const hasFilters = searchQuery || statusFilter;
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        {hasFilters ? (
          <>
            <FileX className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No invoices found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search or filter criteria
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-500">No invoices yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first invoice to get started
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            {isSuperAdmin && <TableHead className="text-right">Total</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-mono text-sm">
                {invoice.invoice_number}
              </TableCell>
              <TableCell className="font-medium">
                {invoice.customer_name}
              </TableCell>
              <TableCell className="text-slate-500">
                {invoice.vehicle_make} {invoice.vehicle_model}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[invoice.status]}>
                  {invoice.status}
                </Badge>
              </TableCell>
              {isSuperAdmin && (
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.total)}
                </TableCell>
              )}
              <TableCell className="text-slate-500">
                {formatDate(invoice.created_at)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/invoices/${invoice.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

