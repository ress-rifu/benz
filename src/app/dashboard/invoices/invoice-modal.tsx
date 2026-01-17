"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { Eye, Printer, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

const DEFAULT_SETTINGS: InvoiceSettings = {
  logo_url: null,
  header_text: "Thank you for choosing Benz Automobile for your vehicle service needs.",
  footer_text: "Payment is due within 30 days. Thank you for your business!",
  primary_color: "#1f2937",
  secondary_color: "#4b5563",
  show_logo: true,
  show_header: true,
  show_footer: true,
  show_vehicle_vin: true,
  show_vehicle_license: true,
  show_customer_email: true,
  show_customer_phone: true,
  show_customer_address: true,
};

interface InvoiceModalProps {
  invoice: Tables<"invoices">;
  items: Tables<"invoice_items">[];
  isSuperAdmin: boolean;
}

export function InvoiceModal({ invoice, items, isSuperAdmin }: InvoiceModalProps) {
  const [open, setOpen] = useState(false);
  
  const settings: InvoiceSettings = invoice.settings_snapshot
    ? (invoice.settings_snapshot as unknown as InvoiceSettings)
    : DEFAULT_SETTINGS;

  const billedByName = invoice.billed_by_name || null;

  const handlePrint = () => {
    // Add class to body to enable modal-specific print styles
    document.body.classList.add('printing-modal');
    
    // Handler to remove class after print dialog closes
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-modal');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Wait for all images to load before printing
    const images = document.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      // Small additional delay to ensure browser paint is complete
      setTimeout(() => {
        window.print();
      }, 150);
    });
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0" hideCloseButton>
          <VisuallyHidden>
            <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
          </VisuallyHidden>
          
          {/* Modal Header - Hidden on Print */}
          <div 
            className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-3 sm:px-6 sm:py-4"
            data-print-hide="true"
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold truncate">Invoice {invoice.invoice_number}</h2>
              <p className="text-xs sm:text-sm text-slate-500">{formatDate(invoice.created_at)}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button onClick={handlePrint} variant="outline" size="sm" className="hidden sm:flex">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={handlePrint} variant="outline" size="icon" className="sm:hidden h-8 w-8">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8 sm:h-9 sm:w-9">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <div
            className="p-4 sm:p-6 print:p-0"
            style={
              {
                "--invoice-primary": settings.primary_color,
                "--invoice-secondary": settings.secondary_color,
              } as React.CSSProperties
            }
          >
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
              <div className="sm:text-right">
                <p className="text-lg sm:text-xl font-bold" style={{ color: settings.primary_color }}>
                  INVOICE
                </p>
                <p className="font-mono text-base sm:text-lg">{invoice.invoice_number}</p>
                <Badge variant="default" className="mt-2">
                  PAID
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
                      <td className="py-3">
                        <div>
                          <p>{item.description}</p>
                          {item.type === "part" && (item.part_model || item.part_serial) && (
                            <p className="text-xs text-slate-500 mt-1">
                              {item.part_model && <span>Model: {item.part_model}</span>}
                              {item.part_model && item.part_serial && <span> • </span>}
                              {item.part_serial && <span>Serial: {item.part_serial}</span>}
                            </p>
                          )}
                        </div>
                      </td>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
