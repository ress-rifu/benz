"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceCategoryFormDialog } from "./service-category-form-dialog";
import { PartCategoryFormDialog } from "./part-category-form-dialog";
import { PartBrandFormDialog } from "./part-brand-form-dialog";
import type { Tables } from "@/types/database";

interface CategoriesHeaderProps {
    isSuperAdmin: boolean;
    categories: Tables<"part_categories">[];
}

export function CategoriesHeader({ isSuperAdmin, categories }: CategoriesHeaderProps) {
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [partDialogOpen, setPartDialogOpen] = useState(false);
    const [brandDialogOpen, setBrandDialogOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Categories & Brands</h1>
                    <p className="text-sm text-slate-500">
                        {isSuperAdmin 
                            ? "Manage service categories, part categories, and brands" 
                            : "View service categories, part categories, and brands"}
                    </p>
                </div>
                {isSuperAdmin && (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setBrandDialogOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Button>
                        <Button variant="outline" onClick={() => setPartDialogOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Part Category
                        </Button>
                        <Button onClick={() => setServiceDialogOpen(true)} className="w-full sm:w-auto">
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
                    <PartBrandFormDialog 
                        open={brandDialogOpen} 
                        onOpenChange={setBrandDialogOpen} 
                        categories={categories}
                    />
                </>
            )}
        </>
    );
}
