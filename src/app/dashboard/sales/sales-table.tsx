"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/types/database";
import { formatDistance } from "date-fns";

interface SalesTableProps {
  invoices: (Omit<Tables<"invoices">, "status"> & { status: "Paid" | "Due" })[];
}

export function SalesTable({ invoices }: SalesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No sales found for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>{invoice.customer_name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {new Date(invoice.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(invoice.created_at), new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${Number(invoice.total).toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={invoice.status === "Paid" ? "default" : "secondary"}
                  className={
                    invoice.status === "Paid"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-500 hover:bg-orange-600"
                  }
                >
                  {invoice.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
