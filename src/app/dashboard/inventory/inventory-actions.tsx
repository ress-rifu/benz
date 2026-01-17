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
import { Edit, MoreHorizontal, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { InventoryFormDialog } from "./inventory-form-dialog";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { DeleteInventoryDialog } from "./delete-inventory-dialog";

interface InventoryActionsProps {
  item: Tables<"inventory_items">;
}

export function InventoryActions({ item }: InventoryActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAdjustOpen(true)}>
            <Package className="mr-2 h-4 w-4" />
            Adjust Stock
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InventoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
      />
      <StockAdjustmentDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        item={item}
      />
      <DeleteInventoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        item={item}
      />
    </>
  );
}

