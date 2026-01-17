"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations/invoice";
import { createInvoice } from "./actions";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { createCustomer } from "../../customers/actions";
import { CustomerFormDialog } from "../../customers/customer-form-dialog";

interface InvoiceFormProps {
  parts: Tables<"parts">[];
  services: (Tables<"services"> & { category_name: string })[];
  customers: Tables<"customers">[];
}

export function InvoiceForm({ parts, services, customers }: InvoiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [customerList, setCustomerList] = useState(customers);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: undefined,
      vehicle_vin: "",
      vehicle_license_plate: "",
      tax_rate: 0,
      discount_amount: 0,
      notes: "",
      items: [{ type: "service", description: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("tax_rate") || 0;
  const watchedDiscount = watch("discount_amount") || 0;

  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unit_price || 0);
  }, 0);

  const taxAmount = subtotal * (watchedTaxRate / 100);
  const total = subtotal + taxAmount - watchedDiscount;

  const handlePartSelect = (index: number, partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (part) {
      setValue(`items.${index}.inventory_item_id`, part.id);
      setValue(`items.${index}.description`, part.name);
      setValue(`items.${index}.unit_price`, part.selling_price);
    }
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`items.${index}.description`, service.name);
      setValue(`items.${index}.unit_price`, service.price);
      setValue(`items.${index}.quantity`, 1); // Services always have quantity 1
    }
  };

  const onSubmit = (data: InvoiceInput) => {
    startTransition(async () => {
      const result = await createInvoice(data);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
        router.push(`/dashboard/invoices/${result.invoiceId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Customer Details</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewCustomer(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Existing Customer</Label>
              <Select
                onValueChange={(customerId) => {
                  const customer = customerList.find((c) => c.id === customerId);
                  if (customer) {
                    setValue("customer_name", customer.name);
                    setValue("customer_email", customer.email || "");
                    setValue("customer_phone", customer.phone || "");
                    setValue("customer_address", customer.address || "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={customerList.length > 0 ? "Choose a customer..." : "No customers yet - create one first"} />
                </SelectTrigger>
                <SelectContent>
                  {customerList.length > 0 ? (
                    customerList.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone && `(${customer.phone})`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-sm text-slate-500">
                      No customers found. Click &quot;New Customer&quot; to add one.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customer_name">Name *</Label>
              <Input id="customer_name" {...register("customer_name")} />
              {errors.customer_name && (
                <p className="text-sm text-red-500">
                  {errors.customer_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register("customer_email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input id="customer_phone" {...register("customer_phone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_address">Address</Label>
              <Textarea id="customer_address" {...register("customer_address")} />
            </div>
          </CardContent>
        </Card>

        {/* New Customer Dialog */}
        <CustomerFormDialog
          open={showNewCustomer}
          onOpenChange={setShowNewCustomer}
        />

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicle_make">Make *</Label>
                <Input id="vehicle_make" {...register("vehicle_make")} />
                {errors.vehicle_make && (
                  <p className="text-sm text-red-500">
                    {errors.vehicle_make.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_model">Model *</Label>
                <Input id="vehicle_model" {...register("vehicle_model")} />
                {errors.vehicle_model && (
                  <p className="text-sm text-red-500">
                    {errors.vehicle_model.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Year</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  {...register("vehicle_year", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_vin">VIN</Label>
                <Input id="vehicle_vin" {...register("vehicle_vin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_license_plate">License Plate</Label>
                <Input
                  id="vehicle_license_plate"
                  {...register("vehicle_license_plate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Invoice Items</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() =>
                  append({
                    type: "service",
                    description: "",
                    quantity: 1,
                    unit_price: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() =>
                  append({
                    type: "part",
                    description: "",
                    quantity: 1,
                    unit_price: 0,
                    inventory_item_id: undefined,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const itemType = watch(`items.${index}.type`);
            const quantity = watch(`items.${index}.quantity`) || (itemType === "service" ? 1 : 0);
            const unitPrice = watch(`items.${index}.unit_price`) || 0;
            const lineTotal = quantity * unitPrice;

            return (
              <div
                key={field.id}
                className="rounded-lg border p-3 sm:p-4 space-y-4"
              >
                {/* Mobile Layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={itemType}
                        onValueChange={(value: "part" | "service") => {
                          setValue(`items.${index}.type`, value);
                          if (value === "service") {
                            setValue(`items.${index}.quantity`, 1);
                            setValue(`items.${index}.part_model`, "");
                            setValue(`items.${index}.part_serial`, "");
                          }
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="part">Part</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 mt-5"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Description</Label>
                    {itemType === "part" ? (
                      <Select onValueChange={(value) => handlePartSelect(index, value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a part" />
                        </SelectTrigger>
                        <SelectContent>
                          {parts.map((part) => (
                            <SelectItem key={part.id} value={part.id}>
                              {part.name} ({part.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select onValueChange={(value) => handleServiceSelect(index, value)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {itemType === "part" && (
                      <div>
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          className="h-9"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </div>
                    )}
                    <div className={itemType === "part" ? "" : "col-span-2"}>
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-9"
                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400">Total</Label>
                      <p className="text-sm font-medium mt-1.5">{formatCurrency(lineTotal)}</p>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-2">
                    <Label>Type</Label>
                    <Select
                      value={itemType}
                      onValueChange={(value: "part" | "service") => {
                        setValue(`items.${index}.type`, value);
                        if (value === "service") {
                          setValue(`items.${index}.quantity`, 1);
                          setValue(`items.${index}.part_model`, "");
                          setValue(`items.${index}.part_serial`, "");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="part">Part</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={itemType === "part" ? "sm:col-span-3" : "sm:col-span-5"}>
                    <Label>Description</Label>
                    {itemType === "part" ? (
                      <Select
                        onValueChange={(value) => handlePartSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a part" />
                        </SelectTrigger>
                        <SelectContent>
                          {parts.map((part) => (
                            <SelectItem key={part.id} value={part.id}>
                              {part.name} ({part.quantity} in stock) - {formatCurrency(part.selling_price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        onValueChange={(value) => handleServiceSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.category_name}) - {formatCurrency(service.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Quantity - only show for parts, services always have qty 1 */}
                  {itemType === "part" ? (
                    <div className="sm:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  ) : (
                    <input type="hidden" {...register(`items.${index}.quantity`)} value={1} />
                  )}

                  <div className="sm:col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unit_price`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <div>
                      <Label className="text-slate-400">Total</Label>
                      <p className="text-sm font-medium mt-2">{formatCurrency(lineTotal)}</p>
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex items-end justify-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Model and Serial fields - only for parts */}
                {itemType === "part" && (
                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-dashed">
                    <div className="space-y-2">
                      <Label>Part Model</Label>
                      <Input
                        placeholder="Enter model number"
                        {...register(`items.${index}.part_model`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input
                        placeholder="Enter serial number"
                        {...register(`items.${index}.part_serial`)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {errors.items && (
            <p className="text-sm text-red-500">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Additional notes for this invoice..."
              {...register("notes")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  {...register("tax_rate", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Discount ($)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  {...register("discount_amount", { valueAsNumber: true })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({watchedTaxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              {watchedDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-red-500">
                    -{formatCurrency(watchedDiscount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/dashboard/invoices")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Invoice
        </Button>
      </div>
    </form>
  );
}

