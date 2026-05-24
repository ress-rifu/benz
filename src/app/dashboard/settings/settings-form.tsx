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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useLanguage } from "@/lib/language/language-context";

interface SettingsFormProps {
  settings: Tables<"invoice_settings">;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();
  const [isUploadingHeader, startUploadHeaderTransition] = useTransition();
  const [isUploadingFooter, startUploadFooterTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const footerImageInputRef = useRef<HTMLInputElement>(null);

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
      margin_top: settings.margin_top ?? 10,
      margin_right: settings.margin_right ?? 10,
      margin_bottom: settings.margin_bottom ?? 10,
      margin_left: settings.margin_left ?? 10,
      header_image_url: settings.header_image_url,
      show_header_image: settings.show_header_image ?? true,
      footer_image_url: settings.footer_image_url,
      show_footer_image: settings.show_footer_image ?? true,
      font_size: settings.font_size ?? "text-sm",
      vat_reg_no: settings.vat_reg_no || "",
      show_vat_reg_no: settings.show_vat_reg_no ?? true,
    },
  });

  const logoUrl = watch("logo_url");
  const headerImageUrl = watch("header_image_url");
  const footerImageUrl = watch("footer_image_url");

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
          title: t("forms.success"),
          description: t("settings.successLogo"),
        });
      }
    });
  };

  const handleHeaderImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "header");

    startUploadHeaderTransition(async () => {
      const result = await uploadLogo(formData);

      if (result?.error) {
        toast({
          title: t("forms.error"),
          description: result.error,
          variant: "destructive",
        });
      } else if (result?.url) {
        setValue("header_image_url", result.url);
        toast({
          title: t("forms.success"),
          description: t("settings.successHeader"),
        });
      }
    });
  };

  const handleFooterImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "footer");

    startUploadFooterTransition(async () => {
      const result = await uploadLogo(formData);

      if (result?.error) {
        toast({
          title: t("forms.error"),
          description: result.error,
          variant: "destructive",
        });
      } else if (result?.url) {
        setValue("footer_image_url", result.url);
        toast({
          title: t("forms.success"),
          description: t("settings.successFooter"),
        });
      }
    });
  };

  const onSubmit = (data: InvoiceSettingsInput) => {
    startTransition(async () => {
      const result = await updateInvoiceSettings(settings.id, data);

      if (result?.error) {
        toast({
          title: t("forms.error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("forms.success"),
          description: t("settings.successSave"),
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Settings Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("dashboard.settings")}</h1>
        <p className="text-sm text-slate-500">{t("settings.customizeSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.branding")}</CardTitle>
            <CardDescription>{t("settings.customizeAppearance")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.logo")}</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative h-16 w-32 overflow-hidden rounded-lg border bg-slate-50">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      sizes="128px"
                      priority
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-400">
                    {t("settings.noLogo")}
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
                    {t("settings.upload")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_color">{t("settings.primaryColor")}</Label>
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
                <Label htmlFor="secondary_color">{t("settings.secondaryColor")}</Label>
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
            
            <Separator />
            
            <div className="space-y-2">
              <Label>{t("settings.fontSize")}</Label>
              <Select
                value={watch("font_size")}
                onValueChange={(value) => setValue("font_size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.selectSize")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-xs">{t("settings.sizeXs")}</SelectItem>
                  <SelectItem value="text-sm">{t("settings.sizeSm")}</SelectItem>
                  <SelectItem value="text-base">{t("settings.sizeMd")}</SelectItem>
                  <SelectItem value="text-lg">{t("settings.sizeLg")}</SelectItem>
                  <SelectItem value="text-xl">{t("settings.sizeXl")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="vat_reg_no">{t("settings.vatRegNo")}</Label>
              <Input
                id="vat_reg_no"
                placeholder="e.g., 123456789-0101"
                {...register("vat_reg_no")}
              />
              {errors.vat_reg_no && (
                <p className="text-sm text-red-500">
                  {errors.vat_reg_no.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Header & Footer */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.textContent")}</CardTitle>
            <CardDescription>
              {t("settings.customizeMessages")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header_text">{t("settings.headerText")}</Label>
              <Textarea id="header_text" {...register("header_text")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_text">{t("settings.footerText")}</Label>
              <Textarea id="footer_text" {...register("footer_text")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Margins */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.margins")}</CardTitle>
          <CardDescription>
            {t("settings.adjustMargins")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="margin_top">{t("settings.marginTop")}</Label>
              <Input
                id="margin_top"
                type="number"
                min={0}
                max={50}
                {...register("margin_top", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin_right">{t("settings.marginRight")}</Label>
              <Input
                id="margin_right"
                type="number"
                min={0}
                max={50}
                {...register("margin_right", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin_bottom">{t("settings.marginBottom")}</Label>
              <Input
                id="margin_bottom"
                type="number"
                min={0}
                max={50}
                {...register("margin_bottom", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin_left">{t("settings.marginLeft")}</Label>
              <Input
                id="margin_left"
                type="number"
                min={0}
                max={50}
                {...register("margin_left", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header & Footer Images */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.headerImage")}</CardTitle>
            <CardDescription>{t("settings.uploadHeaderDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {headerImageUrl ? (
                <div className="relative h-16 w-full max-w-xs overflow-hidden rounded-lg border bg-slate-50">
                  <Image
                    src={headerImageUrl}
                    alt="Header"
                    fill
                    sizes="320px"
                    priority
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-full max-w-xs items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-400">
                  {t("settings.noHeaderImage")}
                </div>
              )}
              <div>
                <input
                  ref={headerImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleHeaderImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => headerImageInputRef.current?.click()}
                  disabled={isUploadingHeader}
                >
                  {isUploadingHeader ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {t("settings.upload")}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_header_image" className="cursor-pointer">
                {t("settings.showHeaderImage")}
              </Label>
              <Switch
                id="show_header_image"
                checked={watch("show_header_image")}
                onCheckedChange={(checked) => setValue("show_header_image", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.footerImage")}</CardTitle>
            <CardDescription>{t("settings.uploadFooterDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {footerImageUrl ? (
                <div className="relative h-16 w-full max-w-xs overflow-hidden rounded-lg border bg-slate-50">
                  <Image
                    src={footerImageUrl}
                    alt="Footer"
                    fill
                    sizes="320px"
                    priority
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-full max-w-xs items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-400">
                  {t("settings.noFooterImage")}
                </div>
              )}
              <div>
                <input
                  ref={footerImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFooterImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => footerImageInputRef.current?.click()}
                  disabled={isUploadingFooter}
                >
                  {isUploadingFooter ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {t("settings.upload")}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_footer_image" className="cursor-pointer">
                {t("settings.showFooterImage")}
              </Label>
              <Switch
                id="show_footer_image"
                checked={watch("show_footer_image")}
                onCheckedChange={(checked) => setValue("show_footer_image", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.fieldVisibility")}</CardTitle>
          <CardDescription>
            {t("settings.visibilityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show_logo" className="cursor-pointer">
                {t("settings.showLogo")}
              </Label>
              <Switch
                id="show_logo"
                checked={watch("show_logo")}
                onCheckedChange={(checked) => setValue("show_logo", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_header" className="cursor-pointer">
                {t("settings.showHeader")}
              </Label>
              <Switch
                id="show_header"
                checked={watch("show_header")}
                onCheckedChange={(checked) => setValue("show_header", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_footer" className="cursor-pointer">
                {t("settings.showFooter")}
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
                {t("settings.customerEmail")}
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
                {t("settings.customerPhone")}
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
                {t("settings.customerAddress")}
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
                {t("settings.vehicleVin")}
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
                {t("settings.licensePlate")}
              </Label>
              <Switch
                id="show_vehicle_license"
                checked={watch("show_vehicle_license")}
                onCheckedChange={(checked) =>
                  setValue("show_vehicle_license", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_vat_reg_no" className="cursor-pointer">
                {t("settings.vatRegNo")}
              </Label>
              <Switch
                id="show_vat_reg_no"
                checked={watch("show_vat_reg_no")}
                onCheckedChange={(checked) =>
                  setValue("show_vat_reg_no", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.saving")}
            </>
          ) : (
            t("settings.saveSettings")
          )}
        </Button>
      </div>
    </form>
  );
}

