"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CustomerFormDialog } from "./customer-form-dialog";
import { useLanguage } from "@/lib/language/language-context";

export function CustomersHeader() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("customers.title")}</h1>
                    <p className="text-sm text-slate-500">
                        {t("customers.noCustomersDesc")}
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("customers.createNew")}
                </Button>
            </div>
            <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
