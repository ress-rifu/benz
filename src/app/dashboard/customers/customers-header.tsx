"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CustomerFormDialog } from "./customer-form-dialog";

export function CustomersHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-sm text-slate-500">
                        Manage your customer database
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </div>
            <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
