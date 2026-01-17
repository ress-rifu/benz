"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { InvoiceActions } from "./invoice-actions";

interface InvoiceSettings {
  logo_url: string | null;
  header_text: string | null;
  footer_text: string | null;
  primary_color: string;
  secondary_color: string;
  show_logo: boolean;
  show_header: boolean;
  show_footer: boolean;
  show_vehicle_vin: boolean;
  show_vehicle_license: boolean;
  show_customer_email: boolean;
  show_customer_phone: boolean;
  show_customer_address: boolean;
}

interface InvoiceViewProps {
  invoice: Tables<"invoices">;
  items: Tables<"invoice_items">[];
  settings: InvoiceSettings;
  isSuperAdmin: boolean;
  billedByName: string | null;
}

const statusColors = {
  draft: "secondary",
  pending: "outline",
  paid: "default",
  cancelled: "destructive",
} as const;

export function InvoiceView({ invoice, items, settings, isSuperAdmin, billedByName }: InvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions - Hidden on Print */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-slate-500">{formatDate(invoice.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceActions invoice={invoice} />
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div
        className="mx-auto max-w-4xl rounded-lg border bg-white p-8 shadow-sm print:shadow-none print:border-0"
        style={
          {
            "--invoice-primary": settings.primary_color,
            "--invoice-secondary": settings.secondary_color,
          } as React.CSSProperties
        }
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between">
          <div>
            {settings.show_logo && settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt="Company Logo"
                width={150}
                height={60}
                className="mb-4"
              />
            ) : (
              <h2
                className="text-2xl font-bold"
                style={{ color: settings.primary_color }}
              >
                Benz Automobile
              </h2>
            )}
            {settings.show_header && settings.header_text && (
              <p className="mt-2 max-w-md text-sm text-slate-500">
                {settings.header_text}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: settings.primary_color }}>
              INVOICE
            </p>
            <p className="font-mono text-lg">{invoice.invoice_number}</p>
            <Badge variant={statusColors[invoice.status]} className="mt-2">
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Customer & Vehicle Info */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-semibold" style={{ color: settings.primary_color }}>
              Bill To
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">{invoice.customer_name}</p>
              {settings.show_customer_email && invoice.customer_email && (
                <p className="text-slate-500">{invoice.customer_email}</p>
              )}
              {settings.show_customer_phone && invoice.customer_phone && (
                <p className="text-slate-500">{invoice.customer_phone}</p>
              )}
              {settings.show_customer_address && invoice.customer_address && (
                <p className="text-slate-500 whitespace-pre-line">
                  {invoice.customer_address}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold" style={{ color: settings.primary_color }}>
              Vehicle Information
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">
                {invoice.vehicle_year && `${invoice.vehicle_year} `}
                {invoice.vehicle_make} {invoice.vehicle_model}
              </p>
              {settings.show_vehicle_vin && invoice.vehicle_vin && (
                <p className="text-slate-500">VIN: {invoice.vehicle_vin}</p>
              )}
              {settings.show_vehicle_license && invoice.vehicle_license_plate && (
                <p className="text-slate-500">
                  License: {invoice.vehicle_license_plate}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold" style={{ color: settings.primary_color }}>
              Billed By
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">{billedByName || "—"}</p>
              <p className="text-slate-500">{formatDate(invoice.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: settings.secondary_color }}
              >
                <th className="py-2 text-left font-semibold">Description</th>
                <th className="py-2 text-center font-semibold">Type</th>
                <th className="py-2 text-right font-semibold">Qty</th>
                {isSuperAdmin && (
                  <>
                    <th className="py-2 text-right font-semibold">Unit Price</th>
                    <th className="py-2 text-right font-semibold">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-center">
                    <Badge variant="secondary" className="capitalize">
                      {item.type}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  {isSuperAdmin && (
                    <>
                      <td className="py-3 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - Only for super admin */}
        {isSuperAdmin && (
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-red-500">
                    -{formatCurrency(invoice.discount_amount)}
                  </span>
                </div>
              )}
              <Separator />
              <div
                className="flex justify-between text-lg font-bold"
                style={{ color: settings.primary_color }}
              >
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-700">Notes</h4>
            <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        {settings.show_footer && settings.footer_text && (
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>{settings.footer_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

