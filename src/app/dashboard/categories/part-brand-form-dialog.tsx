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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { createPartBrand, updatePartBrand } from "./actions";
import { useTransition, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

interface PartBrand extends Tables<"part_brands"> {
    part_categories?: {
        id: string;
        name: string;
        name_bn: string | null;
    } | null;
}

interface PartBrandFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand?: PartBrand;
    categories: Tables<"part_categories">[];
}

interface BrandFormData {
    name: string;
    category_id: string;
    country_of_origin: string;
    is_active: boolean;
}

export function PartBrandFormDialog({
    open,
    onOpenChange,
    brand,
    categories,
}: PartBrandFormDialogProps) {
    const [isPending, startTransition] = useTransition();
    const isEditing = !!brand;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<BrandFormData>({
        defaultValues: brand
            ? {
                name: brand.name,
                category_id: brand.category_id || "",
                country_of_origin: brand.country_of_origin || "",
                is_active: brand.is_active,
            }
            : {
                name: "",
                category_id: "",
                country_of_origin: "",
                is_active: true,
            },
    });

    useEffect(() => {
        if (open) {
            if (brand) {
                reset({
                    name: brand.name,
                    category_id: brand.category_id || "",
                    country_of_origin: brand.country_of_origin || "",
                    is_active: brand.is_active,
                });
            } else {
                reset({
                    name: "",
                    category_id: "",
                    country_of_origin: "",
                    is_active: true,
                });
            }
        }
    }, [open, brand, reset]);

    const onSubmit = (data: BrandFormData) => {
        startTransition(async () => {
            const input = {
                name: data.name,
                category_id: data.category_id,
                country_of_origin: data.country_of_origin || null,
                is_active: data.is_active,
            };

            const result = isEditing
                ? await updatePartBrand(brand.id, input)
                : await createPartBrand(input);

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
                        ? "Brand updated successfully"
                        : "Brand created successfully",
                });
                onOpenChange(false);
            }
        });
    };

    // Filter only active categories
    const activeCategories = categories.filter((c) => c.is_active);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Brand" : "Add Brand"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the brand details below"
                            : "Add a new part brand"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category *</Label>
                        <Controller
                            name="category_id"
                            control={control}
                            rules={{ required: "Category is required" }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeCategories.map((cat) => (
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

                    <div className="space-y-2">
                        <Label htmlFor="name">Brand Name *</Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Name is required" })}
                            placeholder="e.g., Toyota, Bosch, Denso"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country_of_origin">Country of Origin</Label>
                        <Input
                            id="country_of_origin"
                            {...register("country_of_origin")}
                            placeholder="e.g., Japan, Germany"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="is_active">Active</Label>
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="is_active"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
