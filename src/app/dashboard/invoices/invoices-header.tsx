import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function InvoicesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">Create and manage customer invoices</p>
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/dashboard/invoices/new">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Link>
      </Button>
    </div>
  );
}

