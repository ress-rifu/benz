import { z } from "zod";

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  sku: z.string().min(1, "SKU is required").max(50),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  cost_price: z.number().min(0, "Cost price cannot be negative"),
  selling_price: z.number().min(0, "Selling price cannot be negative"),
  description: z.string().max(1000).optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  inventory_item_id: z.string().uuid(),
  action: z.enum(["add", "remove", "adjust"]),
  quantity: z.number().int().positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required for stock adjustments").max(500),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

