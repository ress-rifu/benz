"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceCategoryFormDialog } from "./service-category-form-dialog";
import { PartCategoryFormDialog } from "./part-category-form-dialog";

interface CategoriesHeaderProps {
    isSuperAdmin: boolean;
}

export function CategoriesHeader({ isSuperAdmin }: CategoriesHeaderProps) {
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [partDialogOpen, setPartDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="text-sm text-slate-500">
                        {isSuperAdmin 
                            ? "Manage service and part categories" 
                            : "View service and part categories"}
                    </p>
                </div>
                {isSuperAdmin && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setPartDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Part Category
                        </Button>
                        <Button onClick={() => setServiceDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service Category
                        </Button>
                    </div>
                )}
            </div>
            {isSuperAdmin && (
                <>
                    <ServiceCategoryFormDialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen} />
                    <PartCategoryFormDialog open={partDialogOpen} onOpenChange={setPartDialogOpen} />
                </>
            )}
        </>
    );
}
