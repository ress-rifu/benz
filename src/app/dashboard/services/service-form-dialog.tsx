"use client";

import { useLanguage } from "@/lib/language/language-context";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    serviceSchema,
    type ServiceInput,
} from "@/lib/validations/services";
import { createService, updateService, getServiceCategories } from "./actions";
import { useTransition, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

interface ServiceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service?: Tables<"services">;
}

export function ServiceFormDialog({
    open,
    onOpenChange,
    service,
}: ServiceFormDialogProps) {
    const { t } = useLanguage();
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState<Tables<"service_categories">[]>([]);
    const isEditing = !!service;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<ServiceInput>({
        resolver: zodResolver(serviceSchema),
        defaultValues: service
            ? {
                category_id: service.category_id,
                name: service.name,
                name_bn: service.name_bn,
                description: service.description,
                price: service.price,
                duration_minutes: service.duration_minutes,
                is_active: service.is_active,
            }
            : {
                price: 0,
                duration_minutes: null,
                is_active: true,
            },
    });

    useEffect(() => {
        if (open) {
            getServiceCategories().then(setCategories);
            if (service) {
                reset({
                    category_id: service.category_id,
                    name: service.name,
                    name_bn: service.name_bn,
                    description: service.description,
                    price: service.price,
                    duration_minutes: service.duration_minutes,
                    is_active: service.is_active,
                });
            } else {
                reset({
                    category_id: "",
                    name: "",
                    name_bn: "",
                    description: "",
                    price: 0,
                    duration_minutes: null,
                    is_active: true,
                });
            }
        }
    }, [open, service, reset]);

    const onSubmit = (data: ServiceInput) => {
        startTransition(async () => {
            const result = isEditing
                ? await updateService(service.id, data)
                : await createService(data);

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
                        ? t("forms.serviceUpdated")
                        : t("forms.serviceCreated"),
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
                        {isEditing ? t("forms.editService") : t("forms.addService")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t("forms.updateServiceDetails")
                            : t("forms.addNewService")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category_id">{t("forms.category")}</Label>
                        <Controller
                            name="category_id"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("forms.selectCategory")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name} {cat.name_bn && `(${cat.name_bn})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category_id && (
                            <p className="text-sm text-red-500">{errors.category_id.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("forms.serviceName")}</Label>
                            <Input id="name" placeholder={t("forms.enterName")} {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name_bn">{t("forms.serviceNameBangla")}</Label>
                            <Input id="name_bn" {...register("name_bn")} placeholder="বাংলা নাম" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="price">{t("forms.servicePrice")} (৳)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register("price", { valueAsNumber: true })}
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration_minutes">{t("forms.duration")} ({t("forms.optional")})</Label>
                            <Input
                                id="duration_minutes"
                                type="number"
                                {...register("duration_minutes", { valueAsNumber: true })}
                                placeholder={t("forms.optional")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("forms.description")} ({t("forms.optional")})</Label>
                        <Textarea id="description" {...register("description")} />
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
                            {isEditing ? t("forms.update") : t("forms.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
