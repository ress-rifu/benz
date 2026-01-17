"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, PackagePlus } from "lucide-react";
import { useState } from "react";
import { PartFormDialog } from "./part-form-dialog";
import { DeletePartDialog } from "./delete-part-dialog";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import type { Tables } from "@/types/database";

interface PartActionsProps {
    part: Tables<"parts"> & {
        part_categories?: { id: string; name: string; name_bn: string | null } | null;
        part_brands?: { id: string; name: string; country_of_origin: string | null } | null;
    };
}

export function PartActions({ part }: PartActionsProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStockOpen(true)}>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Adjust Stock
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <PartFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                part={part}
            />
            <DeletePartDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                part={part}
            />
            <StockAdjustmentDialog
                open={stockOpen}
                onOpenChange={setStockOpen}
                part={part}
            />
        </>
    );
}
