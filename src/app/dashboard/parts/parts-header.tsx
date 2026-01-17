"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PartFormDialog } from "./part-form-dialog";

export function PartsHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Parts Inventory</h1>
                    <p className="text-sm text-slate-500">
                        Manage your automotive parts and supplies
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Part
                </Button>
            </div>
            <PartFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
