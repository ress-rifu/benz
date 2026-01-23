import { z } from "zod";

export const invoiceItemSchema = z.object({
  type: z.enum(["part", "service"]),
  part_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price cannot be negative"),
  part_model: z.string().max(100).optional().nullable(),
  part_serial: z.string().max(100).optional().nullable(),
});

export const invoiceSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required").max(255),
  customer_email: z.string().email().optional().nullable().or(z.literal("")),
  customer_phone: z.string().max(50).optional().nullable(),
  customer_address: z.string().max(500).optional().nullable(),
  vehicle_make: z.string().min(1, "Vehicle make is required").max(100),
  vehicle_model: z.string().min(1, "Vehicle model is required").max(100),
  vehicle_year: z.number().int().min(1900).max(2100).optional().nullable(),
  vehicle_vin: z.string().max(50).optional().nullable(),
  vehicle_license_plate: z.string().max(20).optional().nullable(),
  tax_rate: z.number().min(0).max(100),
  discount_amount: z.number().min(0),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["due", "paid"]),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export const invoiceSettingsSchema = z.object({
  logo_url: z.string().url().optional().nullable(),
  header_text: z.string().max(500).optional().nullable(),
  footer_text: z.string().max(500).optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  show_logo: z.boolean(),
  show_header: z.boolean(),
  show_footer: z.boolean(),
  show_vehicle_vin: z.boolean(),
  show_vehicle_license: z.boolean(),
  show_customer_email: z.boolean(),
  show_customer_phone: z.boolean(),
  show_customer_address: z.boolean(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceSettingsInput = z.infer<typeof invoiceSettingsSchema>;

