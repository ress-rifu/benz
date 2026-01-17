"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ServiceFormDialog } from "./service-form-dialog";

export function ServicesHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Services</h1>
                    <p className="text-sm text-slate-500">
                        Manage your automotive service offerings
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service
                </Button>
            </div>
            <ServiceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
