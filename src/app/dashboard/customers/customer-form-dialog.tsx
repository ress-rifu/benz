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
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: isEditing
                        ? "Customer updated successfully"
                        : "Customer created successfully",
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
                        {isEditing ? "Edit Customer" : "Add Customer"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the customer details below"
                            : "Add a new customer to your database"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...register("phone")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" {...register("address")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" {...register("notes")} placeholder="Internal notes about this customer..." />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
