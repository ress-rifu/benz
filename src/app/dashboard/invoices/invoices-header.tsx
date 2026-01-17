import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function InvoicesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-500">Create and manage customer invoices</p>
      </div>
      <Button asChild>
        <Link href="/dashboard/invoices/new">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Link>
      </Button>
    </div>
  );
}

