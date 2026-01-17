"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  invoiceSettingsSchema,
  type InvoiceSettingsInput,
} from "@/lib/validations/invoice";
import { updateInvoiceSettings, uploadLogo } from "./actions";
import { useTransition, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import type { Tables } from "@/types/database";
import Image from "next/image";

interface SettingsFormProps {
  settings: Tables<"invoice_settings">;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceSettingsInput>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      logo_url: settings.logo_url,
      header_text: settings.header_text,
      footer_text: settings.footer_text,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      show_logo: settings.show_logo,
      show_header: settings.show_header,
      show_footer: settings.show_footer,
      show_vehicle_vin: settings.show_vehicle_vin,
      show_vehicle_license: settings.show_vehicle_license,
      show_customer_email: settings.show_customer_email,
      show_customer_phone: settings.show_customer_phone,
      show_customer_address: settings.show_customer_address,
    },
  });

  const logoUrl = watch("logo_url");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startUploadTransition(async () => {
      const result = await uploadLogo(formData);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result?.url) {
        setValue("logo_url", result.url);
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
      }
    });
  };

  const onSubmit = (data: InvoiceSettingsInput) => {
    startTransition(async () => {
      const result = await updateInvoiceSettings(settings.id, data);

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your invoice appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative h-16 w-32 overflow-hidden rounded-lg border bg-slate-50">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-400">
                    No logo
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    {...register("primary_color")}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={watch("primary_color")}
                    onChange={(e) => setValue("primary_color", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                </div>
                {errors.primary_color && (
                  <p className="text-sm text-red-500">
                    {errors.primary_color.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    {...register("secondary_color")}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={watch("secondary_color")}
                    onChange={(e) => setValue("secondary_color", e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                </div>
                {errors.secondary_color && (
                  <p className="text-sm text-red-500">
                    {errors.secondary_color.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header & Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Text Content</CardTitle>
            <CardDescription>
              Customize header and footer messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header_text">Header Text</Label>
              <Textarea id="header_text" {...register("header_text")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Textarea id="footer_text" {...register("footer_text")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Field Visibility</CardTitle>
          <CardDescription>
            Choose which fields to display on invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show_logo" className="cursor-pointer">
                Show Logo
              </Label>
              <Switch
                id="show_logo"
                checked={watch("show_logo")}
                onCheckedChange={(checked) => setValue("show_logo", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_header" className="cursor-pointer">
                Show Header Text
              </Label>
              <Switch
                id="show_header"
                checked={watch("show_header")}
                onCheckedChange={(checked) => setValue("show_header", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_footer" className="cursor-pointer">
                Show Footer Text
              </Label>
              <Switch
                id="show_footer"
                checked={watch("show_footer")}
                onCheckedChange={(checked) => setValue("show_footer", checked)}
              />
            </div>

            <Separator className="col-span-full" />

            <div className="flex items-center justify-between">
              <Label htmlFor="show_customer_email" className="cursor-pointer">
                Customer Email
              </Label>
              <Switch
                id="show_customer_email"
                checked={watch("show_customer_email")}
                onCheckedChange={(checked) =>
                  setValue("show_customer_email", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_customer_phone" className="cursor-pointer">
                Customer Phone
              </Label>
              <Switch
                id="show_customer_phone"
                checked={watch("show_customer_phone")}
                onCheckedChange={(checked) =>
                  setValue("show_customer_phone", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_customer_address" className="cursor-pointer">
                Customer Address
              </Label>
              <Switch
                id="show_customer_address"
                checked={watch("show_customer_address")}
                onCheckedChange={(checked) =>
                  setValue("show_customer_address", checked)
                }
              />
            </div>

            <Separator className="col-span-full" />

            <div className="flex items-center justify-between">
              <Label htmlFor="show_vehicle_vin" className="cursor-pointer">
                Vehicle VIN
              </Label>
              <Switch
                id="show_vehicle_vin"
                checked={watch("show_vehicle_vin")}
                onCheckedChange={(checked) =>
                  setValue("show_vehicle_vin", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_vehicle_license" className="cursor-pointer">
                License Plate
              </Label>
              <Switch
                id="show_vehicle_license"
                checked={watch("show_vehicle_license")}
                onCheckedChange={(checked) =>
                  setValue("show_vehicle_license", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </form>
  );
}

