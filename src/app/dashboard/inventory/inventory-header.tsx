"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InventoryFormDialog } from "./inventory-form-dialog";

export function InventoryHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <p className="text-slate-500">Manage your parts and supplies</p>
      </div>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      <InventoryFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

