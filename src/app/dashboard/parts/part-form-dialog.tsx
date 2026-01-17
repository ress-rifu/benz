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
    partSchema,
    type PartInput,
} from "@/lib/validations/parts";
import { createPart, updatePart, getPartCategories, getPartBrands } from "./actions";
import { useTransition, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

interface PartFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    part?: Tables<"parts">;
}

export function PartFormDialog({
    open,
    onOpenChange,
    part,
}: PartFormDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState<Tables<"part_categories">[]>([]);
    const [brands, setBrands] = useState<Tables<"part_brands">[]>([]);
    const isEditing = !!part;

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PartInput>({
        resolver: zodResolver(partSchema),
        defaultValues: part
            ? {
                category_id: part.category_id,
                brand_id: part.brand_id,
                name: part.name,
                name_bn: part.name_bn,
                sku: part.sku,
                part_number: part.part_number,
                quantity: part.quantity,
                cost_price: part.cost_price,
                selling_price: part.selling_price,
                min_stock_level: part.min_stock_level,
                description: part.description,
                is_active: part.is_active,
            }
            : {
                quantity: 0,
                cost_price: 0,
                selling_price: 0,
                min_stock_level: 5,
                is_active: true,
            },
    });

    // Watch category to filter brands
    const selectedCategoryId = watch("category_id");
    
    // Filter brands by selected category
    const filteredBrands = brands.filter(
        (brand) => brand.category_id === selectedCategoryId || !brand.category_id
    );

    // Reset brand when category changes (only for new parts)
    useEffect(() => {
        if (!isEditing && selectedCategoryId) {
            // Check if current brand belongs to the selected category
            const currentBrandId = watch("brand_id");
            if (currentBrandId) {
                const currentBrand = brands.find((b) => b.id === currentBrandId);
                if (currentBrand && currentBrand.category_id && currentBrand.category_id !== selectedCategoryId) {
                    setValue("brand_id", "");
                }
            }
        }
    }, [selectedCategoryId, brands, isEditing, setValue, watch]);

    useEffect(() => {
        if (open) {
            Promise.all([getPartCategories(), getPartBrands()]).then(([cats, brds]) => {
                setCategories(cats);
                setBrands(brds);
            });

            if (part) {
                reset({
                    category_id: part.category_id,
                    brand_id: part.brand_id,
                    name: part.name,
                    name_bn: part.name_bn,
                    sku: part.sku,
                    part_number: part.part_number,
                    quantity: part.quantity,
                    cost_price: part.cost_price,
                    selling_price: part.selling_price,
                    min_stock_level: part.min_stock_level,
                    description: part.description,
                    is_active: part.is_active,
                });
            } else {
                reset({
                    category_id: "",
                    brand_id: "",
                    name: "",
                    name_bn: "",
                    sku: "",
                    part_number: "",
                    quantity: 0,
                    cost_price: 0,
                    selling_price: 0,
                    min_stock_level: 5,
                    description: "",
                    is_active: true,
                });
            }
        }
    }, [open, part, reset]);

    const onSubmit = (data: PartInput) => {
        // Clean up empty brand_id
        const cleanedData = {
            ...data,
            brand_id: data.brand_id || null,
        };

        startTransition(async () => {
            const result = isEditing
                ? await updatePart(part.id, cleanedData)
                : await createPart(cleanedData);

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
                        ? "Part updated successfully"
                        : "Part created successfully",
                });
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Part" : "Add Part"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the part details below"
                            : "Add a new part to your inventory"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Controller
                                name="category_id"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
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

                        <div className="space-y-2">
                            <Label htmlFor="brand_id">Brand (Optional)</Label>
                            <Controller
                                name="brand_id"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""}
                                        disabled={!selectedCategoryId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !selectedCategoryId 
                                                    ? "Select a category first" 
                                                    : filteredBrands.length === 0 
                                                        ? "No brands for this category" 
                                                        : "Select a brand"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredBrands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id}>
                                                    {brand.name} {brand.country_of_origin && `(${brand.country_of_origin})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {selectedCategoryId && filteredBrands.length === 0 && (
                                <p className="text-xs text-amber-600">
                                    No brands available for this category. Add brands in Categories page.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name (English)</Label>
                            <Input id="name" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name_bn">Name (Bengali)</Label>
                            <Input id="name_bn" {...register("name_bn")} placeholder="বাংলা নাম" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" {...register("sku")} placeholder="e.g., PART-001" />
                            {errors.sku && (
                                <p className="text-sm text-red-500">{errors.sku.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="part_number">OEM Part Number</Label>
                            <Input id="part_number" {...register("part_number")} placeholder="Optional" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Initial Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                {...register("quantity", { valueAsNumber: true })}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500">{errors.quantity.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cost_price">Cost Price (৳)</Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="0.01"
                                {...register("cost_price", { valueAsNumber: true })}
                            />
                            {errors.cost_price && (
                                <p className="text-sm text-red-500">{errors.cost_price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="selling_price">Selling Price (৳)</Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="0.01"
                                {...register("selling_price", { valueAsNumber: true })}
                            />
                            {errors.selling_price && (
                                <p className="text-sm text-red-500">{errors.selling_price.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="min_stock_level">Minimum Stock Level (for alerts)</Label>
                        <Input
                            id="min_stock_level"
                            type="number"
                            {...register("min_stock_level", { valueAsNumber: true })}
                            className="max-w-[200px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" {...register("description")} />
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
