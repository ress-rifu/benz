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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { createPartCategory, updatePartCategory } from "./actions";
import { useTransition, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CategoryFormData {
    name: string;
    name_bn: string | null;
    description: string | null;
    is_active: boolean;
}

interface PartCategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: {
        id: string;
        name: string;
        name_bn: string | null;
        description: string | null;
        is_active: boolean;
    };
}

export function PartCategoryFormDialog({
    open,
    onOpenChange,
    category,
}: PartCategoryFormDialogProps) {
    const { t } = useLanguage();
    const [isPending, startTransition] = useTransition();
    const isEditing = !!category;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CategoryFormData>({
        defaultValues: category
            ? {
                name: category.name,
                name_bn: category.name_bn,
                description: category.description,
                is_active: category.is_active,
            }
            : {
                name: "",
                name_bn: "",
                description: "",
                is_active: true,
            },
    });

    useEffect(() => {
        if (open) {
            if (category) {
                reset({
                    name: category.name,
                    name_bn: category.name_bn,
                    description: category.description,
                    is_active: category.is_active,
                });
            } else {
                reset({
                    name: "",
                    name_bn: "",
                    description: "",
                    is_active: true,
                });
            }
        }
    }, [open, category, reset]);

    const onSubmit = (data: CategoryFormData) => {
        startTransition(async () => {
            const result = isEditing
                ? await updatePartCategory(category.id, data)
                : await createPartCategory(data);

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
                        ? t("forms.partCategoryUpdated")
                        : t("forms.partCategoryCreated"),
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
                        {isEditing ? t("forms.editPartCategory") : t("forms.addPartCategory")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t("forms.updateCategoryDetails")
                            : t("forms.addNewPartCategory")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("forms.categoryName")} *</Label>
                        <Input id="name" placeholder={t("forms.enterName")} {...register("name", { required: "Name is required" })} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_bn">{t("forms.categoryNameBangla")}</Label>
                        <Input id="name_bn" {...register("name_bn")} placeholder="বাংলা নাম" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("forms.description")}</Label>
                        <Textarea id="description" {...register("description")} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="is_active" className="cursor-pointer">{t("forms.active")}</Label>
                        <Switch
                            id="is_active"
                            checked={watch("is_active")}
                            onCheckedChange={(checked) => setValue("is_active", checked)}
                        />
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
