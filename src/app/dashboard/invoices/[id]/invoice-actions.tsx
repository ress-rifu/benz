"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/types/database";
import { Check, MoreHorizontal, X } from "lucide-react";
import { updateInvoiceStatus } from "./actions";
import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";

interface InvoiceActionsProps {
  invoice: Tables<"invoices">;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "paid" | "cancelled") => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, status);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Invoice marked as ${status}`,
        });
      }
    });
  };

  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange("paid")}>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Mark as Paid
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange("cancelled")}
          className="text-red-600"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

