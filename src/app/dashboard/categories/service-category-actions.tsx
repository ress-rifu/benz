"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ServiceCategoryFormDialog } from "./service-category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

interface ServiceCategoryActionsProps {
    category: {
        id: string;
        name: string;
        name_bn: string | null;
        description: string | null;
        is_active: boolean;
    };
}

export function ServiceCategoryActions({ category }: ServiceCategoryActionsProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

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

            <ServiceCategoryFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                category={category}
            />
            <DeleteCategoryDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                category={category}
                type="service"
            />
        </>
    );
}
