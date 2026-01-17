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
  inventoryItemSchema,
  type InventoryItemInput,
} from "@/lib/validations/inventory";
import { createInventoryItem, updateInventoryItem } from "./actions";
import { useTransition, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Tables<"inventory_items">;
}

export function InventoryFormDialog({
  open,
  onOpenChange,
  item,
}: InventoryFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!item;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryItemInput>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          cost_price: item.cost_price,
          selling_price: item.selling_price,
          description: item.description,
        }
      : {
          quantity: 0,
          cost_price: 0,
          selling_price: 0,
        },
  });

  useEffect(() => {
    if (open && item) {
      reset({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        description: item.description,
      });
    } else if (open && !item) {
      reset({
        name: "",
        sku: "",
        quantity: 0,
        cost_price: 0,
        selling_price: 0,
        description: "",
      });
    }
  }, [open, item, reset]);

  const onSubmit = (data: InventoryItemInput) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateInventoryItem(item.id, data)
        : await createInventoryItem(data);

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
            ? "Item updated successfully"
            : "Item created successfully",
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
            {isEditing ? "Edit Item" : "Add Inventory Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the item details below"
              : "Add a new part or supply to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
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
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                {...register("cost_price", { valueAsNumber: true })}
              />
              {errors.cost_price && (
                <p className="text-sm text-red-500">
                  {errors.cost_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                {...register("selling_price", { valueAsNumber: true })}
              />
              {errors.selling_price && (
                <p className="text-sm text-red-500">
                  {errors.selling_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register("description")} />
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

