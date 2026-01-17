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
    partStockAdjustmentSchema,
    type PartStockAdjustmentInput,
} from "@/lib/validations/parts";
import { adjustPartStock } from "./actions";
import { useTransition, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, PackagePlus, PackageMinus, Package } from "lucide-react";
import type { Tables } from "@/types/database";

interface StockAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    part: Tables<"parts">;
}

export function StockAdjustmentDialog({
    open,
    onOpenChange,
    part,
}: StockAdjustmentDialogProps) {
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm<PartStockAdjustmentInput>({
        resolver: zodResolver(partStockAdjustmentSchema),
        defaultValues: {
            part_id: part.id,
            action: "add",
            quantity: 0,
            reason: "",
        },
    });

    const selectedAction = watch("action");

    useEffect(() => {
        if (open) {
            reset({
                part_id: part.id,
                action: "add",
                quantity: 0,
                reason: "",
            });
        }
    }, [open, part.id, reset]);

    const onSubmit = (data: PartStockAdjustmentInput) => {
        startTransition(async () => {
            const result = await adjustPartStock(data);

            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Stock adjusted successfully",
                });
                onOpenChange(false);
            }
        });
    };

    const getNewQuantity = (action: string, currentQty: number, changeQty: number) => {
        switch (action) {
            case "add":
                return currentQty + changeQty;
            case "remove":
                return Math.max(0, currentQty - changeQty);
            case "adjust":
                return changeQty;
            default:
                return currentQty;
        }
    };

    const watchedQuantity = watch("quantity") || 0;
    const newQuantity = getNewQuantity(selectedAction, part.quantity, watchedQuantity);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        Adjust stock level for &quot;{part.name}&quot; (SKU: {part.sku})
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-slate-50 p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current Stock</span>
                        <span className="text-lg font-semibold text-slate-900">
                            {part.quantity}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-600">After Adjustment</span>
                        <span className={`text-lg font-semibold ${newQuantity < (part.min_stock_level || 5)
                                ? "text-red-600"
                                : "text-green-600"
                            }`}>
                            {newQuantity}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register("part_id")} value={part.id} />

                    <div className="space-y-2">
                        <Label htmlFor="action">Action</Label>
                        <Controller
                            name="action"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="add">
                                            <div className="flex items-center">
                                                <PackagePlus className="mr-2 h-4 w-4 text-green-600" />
                                                Add Stock
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="remove">
                                            <div className="flex items-center">
                                                <PackageMinus className="mr-2 h-4 w-4 text-red-600" />
                                                Remove Stock
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="adjust">
                                            <div className="flex items-center">
                                                <Package className="mr-2 h-4 w-4 text-blue-600" />
                                                Set Exact Quantity
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            {selectedAction === "adjust" ? "New Quantity" : "Quantity to " + selectedAction}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            {...register("quantity", { valueAsNumber: true })}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                            id="reason"
                            {...register("reason")}
                            placeholder="e.g., Stock count correction, New shipment received"
                        />
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
                            Adjust Stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
