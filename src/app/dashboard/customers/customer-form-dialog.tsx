"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    customerSchema,
    type CustomerInput,
} from "@/lib/validations/customers";
import { createCustomer, updateCustomer } from "./actions";
import { useTransition, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";
import { useLanguage } from "@/lib/language/language-context";

interface CustomerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Tables<"customers">;
}

export function CustomerFormDialog({
    open,
    onOpenChange,
    customer,
}: CustomerFormDialogProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!customer;
    const { t } = useLanguage();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomerInput>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer
            ? {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                notes: customer.notes,
                is_active: customer.is_active,
            }
            : {
                name: "",
                email: "",
                phone: "",
                address: "",
                notes: "",
                is_active: true,
            },
    });

    useEffect(() => {
        if (open) {
            if (customer) {
                reset({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    notes: customer.notes,
                    is_active: customer.is_active,
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    notes: "",
                    is_active: true,
                });
            }
        }
    }, [open, customer, reset]);

    const onSubmit = (data: CustomerInput) => {
        startTransition(async () => {
            const result = isEditing
                ? await updateCustomer(customer.id, data)
                : await createCustomer(data);

            if (result?.error) {
                toast({
                    title: t("forms.error"),
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("forms.success"),
                    description: isEditing
                        ? t("forms.customerUpdated")
                        : t("forms.customerCreated"),
                });
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t("forms.editCustomer") : t("forms.addCustomer")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t("forms.editCustomer")
                            : t("forms.addCustomer")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("forms.name")} *</Label>
                        <Input id="name" placeholder={t("forms.enterName")} {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t("forms.phone")}</Label>
                            <Input id="phone" placeholder={t("forms.enterPhone")} {...register("phone")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("forms.email")}</Label>
                            <Input id="email" type="email" placeholder={t("forms.enterEmail")} {...register("email")} />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">{t("forms.address")}</Label>
                        <Textarea id="address" placeholder={t("forms.enterAddress")} {...register("address")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">{t("forms.notes")}</Label>
                        <Textarea id="notes" {...register("notes")} placeholder={`${t("forms.notes")} (${t("forms.optional")})`} />
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => onOpenChange(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? t("forms.saving") : (isEditing ? t("common.update") : t("common.create"))}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
