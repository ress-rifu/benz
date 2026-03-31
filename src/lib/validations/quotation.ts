import { z } from "zod";

export const quotationItemSchema = z.object({
  type: z.enum(["part", "service"]),
  part_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price cannot be negative"),
  part_model: z.string().max(100).optional().nullable(),
  part_serial: z.string().max(100).optional().nullable(),
});

export const quotationSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(255),
  customer_email: z.string().email().optional().nullable().or(z.literal("")),
  customer_phone: z.string().max(50).optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  vehicle_make: z.string().min(1, "Vehicle make is required").max(100),
  vehicle_model: z.string().min(1, "Vehicle model is required").max(100),
  vehicle_year: z.number().int().min(1900).max(2100).optional().nullable(),
  vehicle_vin: z.string().max(50).optional().nullable(),
  vehicle_license_plate: z.string().max(20).optional().nullable(),
  vehicle_mileage: z.number().int().min(0).max(9999999).optional().nullable(),
  driver_name: z.string().max(255).optional().nullable(),
  tax_rate: z.number().min(0).max(100),
  discount_amount: z.number().min(0),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
});

export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
