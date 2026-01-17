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
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Tables } from "@/types/database";

async function getInvoices(): Promise<Tables<"invoices">[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

const statusColors = {
  draft: "secondary",
  pending: "outline",
  paid: "default",
  cancelled: "destructive",
} as const;

export async function InvoicesTable() {
  const invoices = await getInvoices();

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No invoices yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Create your first invoice to get started
        </p>
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
            <TableHead className="text-right">Total</TableHead>
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
              <TableCell className="text-right font-medium">
                {formatCurrency(invoice.total)}
              </TableCell>
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

