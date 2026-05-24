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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { quotationSchema, type QuotationInput } from "@/lib/validations/quotation";
import { createQuotation } from "./actions";
import { useState, useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { createCustomer } from "../../customers/actions";
import { CustomerFormDialog } from "../../customers/customer-form-dialog";

interface QuotationFormProps {
  parts: Tables<"parts">[];
  services: (Tables<"services"> & { category_name: string })[];
  customers: Tables<"customers">[];
}

export function QuotationForm({ parts, services, customers }: QuotationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [customerList, setCustomerList] = useState(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<Record<number, string>>({});
  const router = useRouter();

  // Build options for searchable selects
  const customerOptions = customerList.map((customer) => ({
    value: customer.id,
    label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ""}`,
  }));

  const partOptions = parts.map((part) => ({
    value: part.id,
    label: `${part.name} (${part.quantity} in stock) - ${formatCurrency(part.selling_price)}`,
  }));

  const partOptionsMobile = parts.map((part) => ({
    value: part.id,
    label: `${part.name} (${part.quantity})`,
  }));

  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: `${service.name} (${service.category_name}) - ${formatCurrency(service.price)}`,
  }));

  const serviceOptionsMobile = services.map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
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
      vehicle_mileage: undefined,
      tax_rate: 0,
      discount_amount: 0,
      notes: "",
      items: [{ type: "service", mode: "inventory", description: "", quantity: 1, unit_price: 0 }],
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
      setValue(`items.${index}.part_id`, part.id);
      setValue(`items.${index}.description`, part.name);
      setValue(`items.${index}.unit_price`, part.selling_price);
      setSelectedItemIds((prev) => ({ ...prev, [index]: partId }));
    }
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setValue(`items.${index}.description`, service.name);
      setValue(`items.${index}.unit_price`, service.price);
      setValue(`items.${index}.quantity`, 1);
      setSelectedItemIds((prev) => ({ ...prev, [index]: serviceId }));
    }
  };

  const onSubmit = (data: QuotationInput) => {
    startTransition(async () => {
      const result = await createQuotation(data);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Quotation created successfully",
        });
        router.push(`/dashboard/quotations/${result.quotationId}`);
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
              <SearchableSelect
                options={customerOptions}
                value={selectedCustomerId}
                onValueChange={(customerId) => {
                  setSelectedCustomerId(customerId);
                  const customer = customerList.find((c) => c.id === customerId);
                  if (customer) {
                    setValue("customer_name", customer.name);
                    setValue("customer_email", customer.email || "");
                    setValue("customer_phone", customer.phone || "");
                    setValue("customer_address", customer.address || "");
                  }
                }}
                placeholder={customerList.length > 0 ? "Choose a customer..." : "No customers yet - create one first"}
                searchPlaceholder="Search customers..."
                emptyMessage="No customers found."
              />
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

            <div className="space-y-2">
              <Label htmlFor="vehicle_mileage">Odometer / Distance (km)</Label>
              <Input
                id="vehicle_mileage"
                type="number"
                min="0"
                placeholder="e.g., 45000"
                {...register("vehicle_mileage", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Record vehicle mileage for oil change tracking
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name</Label>
              <Input
                id="driver_name"
                placeholder="Enter driver name"
                {...register("driver_name")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Items */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Quotation Items</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() =>
                  append({
                    type: "service",
                    mode: "inventory",
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
                    mode: "inventory",
                    description: "",
                    quantity: 1,
                    unit_price: 0,
                    part_id: undefined,
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
            const itemMode = watch(`items.${index}.mode`) || "inventory";
            const quantity = watch(`items.${index}.quantity`) || (itemType === "service" ? 1 : 0);
            const unitPrice = watch(`items.${index}.unit_price`) || 0;
            const lineTotal = quantity * unitPrice;

            return (
              <div
                key={field.id}
                className="relative rounded-lg border p-3 sm:p-4 bg-slate-50/30"
              >
                {/* Mobile Layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50/50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={itemType}
                        onValueChange={(value: "part" | "service") => {
                          setValue(`items.${index}.type`, value);
                          setSelectedItemIds((prev) => ({ ...prev, [index]: "" }));
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

                    <div>
                      <Label className="text-xs">Source</Label>
                      <Select
                        value={itemMode}
                        onValueChange={(value: "inventory" | "manual") => {
                          setValue(`items.${index}.mode`, value);
                          setValue(`items.${index}.description`, "");
                          setValue(`items.${index}.unit_price`, 0);
                          setValue(`items.${index}.part_id`, undefined);
                          setSelectedItemIds((prev) => ({ ...prev, [index]: "" }));
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Description</Label>
                    {itemMode === "inventory" ? (
                      itemType === "part" ? (
                        <SearchableSelect
                          options={partOptionsMobile}
                          value={selectedItemIds[index] || ""}
                          onValueChange={(value) => handlePartSelect(index, value)}
                          placeholder="Select a part"
                          searchPlaceholder="Search parts..."
                          emptyMessage="No parts found."
                          triggerClassName="h-9"
                        />
                      ) : (
                        <SearchableSelect
                          options={serviceOptionsMobile}
                          value={selectedItemIds[index] || ""}
                          onValueChange={(value) => handleServiceSelect(index, value)}
                          placeholder="Select a service"
                          searchPlaceholder="Search services..."
                          emptyMessage="No services found."
                          triggerClassName="h-9"
                        />
                      )
                    ) : (
                      <Input
                        placeholder={itemType === "part" ? "Enter custom part name..." : "Enter custom service name..."}
                        className="h-9"
                        {...register(`items.${index}.description`)}
                      />
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

                  {/* Model and Serial fields - Mobile (only for parts) */}
                  {itemType === "part" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
                      <div>
                        <Label className="text-xs">Model</Label>
                        <Input
                          placeholder="Model #"
                          className="h-9"
                          {...register(`items.${index}.part_model`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Serial</Label>
                        <Input
                          placeholder="Serial #"
                          className="h-9"
                          {...register(`items.${index}.part_serial`)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid gap-4 sm:grid-cols-12 items-start">
                  <div className="sm:col-span-2">
                    <Label>Type</Label>
                    <Select
                      value={itemType}
                      onValueChange={(value: "part" | "service") => {
                        setValue(`items.${index}.type`, value);
                        setSelectedItemIds((prev) => ({ ...prev, [index]: "" }));
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

                  <div className="sm:col-span-2">
                    <Label>Source</Label>
                    <Select
                      value={itemMode}
                      onValueChange={(value: "inventory" | "manual") => {
                        setValue(`items.${index}.mode`, value);
                        setValue(`items.${index}.description`, "");
                        setValue(`items.${index}.unit_price`, 0);
                        setValue(`items.${index}.part_id`, undefined);
                        setSelectedItemIds((prev) => ({ ...prev, [index]: "" }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={itemType === "part" ? "sm:col-span-3" : "sm:col-span-4"}>
                    <Label>Description</Label>
                    {itemMode === "inventory" ? (
                      itemType === "part" ? (
                        <SearchableSelect
                          options={partOptions}
                          value={selectedItemIds[index] || ""}
                          onValueChange={(value) => handlePartSelect(index, value)}
                          placeholder="Select a part"
                          searchPlaceholder="Search parts..."
                          emptyMessage="No parts found."
                        />
                      ) : (
                        <SearchableSelect
                          options={serviceOptions}
                          value={selectedItemIds[index] || ""}
                          onValueChange={(value) => handleServiceSelect(index, value)}
                          placeholder="Select a service"
                          searchPlaceholder="Search services..."
                          emptyMessage="No services found."
                        />
                      )
                    ) : (
                      <Input
                        placeholder={itemType === "part" ? "Enter custom part name..." : "Enter custom service name..."}
                        {...register(`items.${index}.description`)}
                      />
                    )}
                  </div>

                  {/* Quantity - only show for parts */}
                  {itemType === "part" ? (
                    <div className="sm:col-span-1">
                      <Label>Qty</Label>
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

                  <div className="sm:col-span-1 flex flex-col justify-end h-full min-h-[58px]">
                    <Label className="text-slate-400">Total</Label>
                    <p className="text-sm font-medium mt-2">{formatCurrency(lineTotal)}</p>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end h-full min-h-[58px] pt-5">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Model and Serial fields - Desktop (only for parts) */}
                  {itemType === "part" && (
                    <>
                      <div className="sm:col-span-6 pt-2 border-t border-dashed">
                        <Label className="text-xs text-slate-500">Part Model</Label>
                        <Input
                          placeholder="Enter model number"
                          {...register(`items.${index}.part_model`)}
                        />
                      </div>
                      <div className="sm:col-span-6 pt-2 border-t border-dashed">
                        <Label className="text-xs text-slate-500">Serial Number</Label>
                        <Input
                          placeholder="Enter serial number"
                          {...register(`items.${index}.part_serial`)}
                        />
                      </div>
                    </>
                  )}
                </div>
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
              placeholder="Additional notes for this quotation..."
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
          onClick={() => router.push("/dashboard/quotations")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Quotation
        </Button>
      </div>
    </form>
  );
}
