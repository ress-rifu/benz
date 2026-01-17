"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PartFormDialog } from "./part-form-dialog";

export function PartsHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Parts Inventory</h1>
                    <p className="text-sm text-slate-500">
                        Manage your automotive parts and supplies
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Part
                </Button>
            </div>
            <PartFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
