"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";
import { ArrowLeft, Printer, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { updateInvoiceStatus } from "./actions";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  header_image_url: string | null;
  show_header_image: boolean;
  footer_image_url: string | null;
  show_footer_image: boolean;
}

// Convert number to words for invoice amount
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(Math.abs(num));

  const n = Math.floor(num);
  let words = '';

  if (n >= 10000000) {
    words += numberToWords(Math.floor(n / 10000000)) + ' Crore ';
    return words + numberToWords(n % 10000000);
  }
  if (n >= 100000) {
    words += numberToWords(Math.floor(n / 100000)) + ' Lakh ';
    return words + numberToWords(n % 100000);
  }
  if (n >= 1000) {
    words += numberToWords(Math.floor(n / 1000)) + ' Thousand ';
    return words + numberToWords(n % 1000);
  }
  if (n >= 100) {
    words += ones[Math.floor(n / 100)] + ' Hundred ';
    return words + numberToWords(n % 100);
  }
  if (n >= 20) {
    words += tens[Math.floor(n / 10)] + ' ';
    return words + ones[n % 10];
  }
  return words + ones[n];
}

interface InvoiceViewProps {
  invoice: Tables<"invoices">;
  items: Tables<"invoice_items">[];
  settings: InvoiceSettings;
  isSuperAdmin: boolean;
  billedByName: string | null;
}

export function InvoiceView({ invoice, items, settings, isSuperAdmin, billedByName }: InvoiceViewProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(invoice.status);

  const handlePrint = () => {
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

  const handleStatusChange = () => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, "paid");

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setCurrentStatus("paid");
        toast({
          title: "Success",
          description: "Invoice marked as paid",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions - Hidden on Print */}
      <div className="flex items-center justify-between" data-print-hide="true">
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
          <Badge
            variant={currentStatus === "paid" ? "default" : "secondary"}
            className={
              currentStatus === "paid"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }
          >
            {currentStatus === "paid" ? "Paid" : "Due"}
          </Badge>
          {currentStatus === "due" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark Invoice as Paid?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will update the invoice status to "Paid" and include it in revenue
                    calculations. This action will update the dashboard and sales reports
                    immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStatusChange}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Document - Benz.pdf Layout */}
      <div
        data-invoice-document="true"
        className="mx-auto max-w-4xl bg-white shadow-sm print:shadow-none print:max-w-none print:mx-0"
        style={
          {
            "--invoice-primary": settings.primary_color,
            "--invoice-secondary": settings.secondary_color,
            "--print-margin-top": `${settings.margin_top ?? 10}mm`,
            "--print-margin-right": `${settings.margin_right ?? 10}mm`,
            "--print-margin-bottom": `${settings.margin_bottom ?? 10}mm`,
            "--print-margin-left": `${settings.margin_left ?? 10}mm`,
          } as React.CSSProperties
        }
      >
        {/* Header - Full Width Image OR Coded Banner */}
        {settings.show_header_image && settings.header_image_url ? (
          /* Full-width header image - no margins, stuck to edges */
          <div className="w-full">
            <Image
              src={settings.header_image_url}
              alt="Invoice Header"
              width={1000}
              height={200}
              className="w-full h-auto object-contain"
              style={{ display: 'block' }}
            />
          </div>
        ) : (
          /* Fallback: Coded Header Banner */
          <>
            <div className="bg-blue-600 text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.show_logo && settings.logo_url ? (
                    <Image
                      src={settings.logo_url}
                      alt="Logo"
                      width={50}
                      height={50}
                      className="rounded bg-white p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">BENZ</span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold">Benz Automobiles & Motors</h1>
                    <p className="text-xs text-blue-100">Automobile Workshop</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Bar */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-600">📍</span>
                <span className="font-medium">{settings.header_text || "Golamnabi Road, Kabirpur, Ashulia, Savar, Dhaka."}</span>
              </div>
              <div className="text-right text-xs space-y-0.5">
                {invoice.customer_phone && <p>📞 {invoice.customer_phone}</p>}
              </div>
            </div>
          </>
        )}

        {/* Invoice Content */}
        <div className="p-4 space-y-4">
          {/* Invoice No & Date Row */}
          <div className="border border-slate-300 flex">
            <div className="flex-1 px-3 py-2 border-r border-slate-300">
              <span className="font-semibold">Invoice No:</span>
              <span className="ml-2">{invoice.invoice_number}</span>
            </div>
            <div className="px-3 py-2">
              <span className="font-semibold">Date:</span>
              <span className="ml-2">{formatDate(invoice.created_at)}</span>
            </div>
          </div>

          {/* Customer & Vehicle Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex">
                <span className="font-semibold w-32">Customer Name</span>
                <span>: {invoice.customer_name}</span>
              </div>
              {settings.show_customer_address && invoice.customer_address && (
                <div className="flex">
                  <span className="font-semibold w-32">Address</span>
                  <span>: {invoice.customer_address}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-semibold w-32">Engine</span>
                <span>: {invoice.vehicle_vin || "-"}</span>
              </div>
              {settings.show_customer_phone && invoice.customer_phone && (
                <div className="flex">
                  <span className="font-semibold w-32">Mobile Number</span>
                  <span>: {invoice.customer_phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="font-semibold w-32">Vehicle Reg No</span>
                <span>: {invoice.vehicle_license_plate || "-"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Brand</span>
                <span>: {invoice.vehicle_make || "-"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Model</span>
                <span>: {invoice.vehicle_model || "-"}</span>
              </div>
              {invoice.vehicle_mileage && (
                <div className="flex">
                  <span className="font-semibold w-32">Mileage (km)</span>
                  <span>: {invoice.vehicle_mileage.toLocaleString()}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-semibold w-32">Status</span>
                <span>: <span className={currentStatus === "paid" ? "text-green-600" : "text-orange-600"}>{currentStatus === "paid" ? "Paid" : "Due"}</span></span>
              </div>
            </div>
          </div>

          {/* Service Charge Table */}
          {items.filter(i => i.type === "service").length > 0 && (
            <div className="border border-slate-400">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400">
                    <th className="border-r border-slate-400 px-2 py-1.5 text-left w-12">SL No</th>
                    <th className="border-r border-slate-400 px-2 py-1.5 text-left">Service Charge</th>
                    <th className="border-r border-slate-400 px-2 py-1.5 text-center w-16">Qty</th>
                    {isSuperAdmin && (
                      <>
                        <th className="border-r border-slate-400 px-2 py-1.5 text-right w-24">Unit Price</th>
                        <th className="px-2 py-1.5 text-right w-28">Amount(TK)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.type === "service").map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="border-r border-slate-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border-r border-slate-300 px-2 py-1.5">{item.description}</td>
                      <td className="border-r border-slate-300 px-2 py-1.5 text-center">{item.quantity}</td>
                      {isSuperAdmin && (
                        <>
                          <td className="border-r border-slate-300 px-2 py-1.5 text-right">{item.unit_price.toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-right font-medium">{item.total.toFixed(2)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Item Description Table (Parts) */}
          {items.filter(i => i.type === "part").length > 0 && (
            <div className="border border-slate-400">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400">
                    <th className="border-r border-slate-400 px-2 py-1.5 text-left w-12">SL No</th>
                    <th className="border-r border-slate-400 px-2 py-1.5 text-left">Item Description</th>
                    <th className="border-r border-slate-400 px-2 py-1.5 text-center w-16">Qty</th>
                    {isSuperAdmin && (
                      <>
                        <th className="border-r border-slate-400 px-2 py-1.5 text-right w-24">Unit Price</th>
                        <th className="px-2 py-1.5 text-right w-28">Amount(TK)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.type === "part").map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="border-r border-slate-300 px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="border-r border-slate-300 px-2 py-1.5">
                        {item.description}
                        {(item.part_model || item.part_serial) && (
                          <span className="text-xs text-slate-500 ml-2">
                            {item.part_model && `(${item.part_model})`}
                          </span>
                        )}
                      </td>
                      <td className="border-r border-slate-300 px-2 py-1.5 text-center">
                        {item.quantity} {item.quantity > 1 ? "pcs" : "pc"}
                      </td>
                      {isSuperAdmin && (
                        <>
                          <td className="border-r border-slate-300 px-2 py-1.5 text-right">{item.unit_price.toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-right font-bold text-blue-700">{item.total.toFixed(2)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes & Totals Section */}
          <div className="flex justify-between text-sm">
            {/* Notes */}
            <div className="max-w-xs text-xs text-slate-600">
              {invoice.notes ? (
                <p className="whitespace-pre-line">{invoice.notes}</p>
              ) : (
                <p>Note: After The Completion Of The Vehicle Work And The Handover Of the Vehicle, If Any Problem Arises Related to That work, It Must Be Reported To Service Center Within Two(2) Days. Otherwise It Will Not Be Acceptable.</p>
              )}
            </div>

            {/* Totals */}
            {isSuperAdmin && (
              <div data-invoice-totals="true" className="border border-slate-400 text-right">
                <div className="flex border-b border-slate-300">
                  <div className="px-3 py-1.5 border-r border-slate-300 font-semibold bg-slate-50 w-32">Grand Total</div>
                  <div className="px-3 py-1.5 w-28">{invoice.subtotal.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-slate-300">
                  <div className="px-3 py-1.5 border-r border-slate-300 font-semibold bg-slate-50 w-32">Vat & Tax</div>
                  <div className="px-3 py-1.5 w-28">{invoice.tax_amount.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-slate-300">
                  <div className="px-3 py-1.5 border-r border-slate-300 font-semibold bg-slate-50 w-32">Discount</div>
                  <div className="px-3 py-1.5 w-28">{invoice.discount_amount.toFixed(2)}</div>
                </div>
                <div className="flex bg-slate-100">
                  <div className="px-3 py-1.5 border-r border-slate-300 font-bold w-32">Total Bill Amount</div>
                  <div className="px-3 py-1.5 w-28 font-bold">{invoice.total.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Amount in Words */}
          {isSuperAdmin && (
            <div className="border border-slate-300 px-3 py-2 bg-slate-50">
              <span className="font-semibold">In word:</span>
              <span className="ml-2">{numberToWords(invoice.total)} Taka Only</span>
            </div>
          )}

          {/* Footer */}
          {settings.show_footer && settings.footer_text && (
            <div className="text-center text-sm text-slate-500 py-2">
              <p>{settings.footer_text}</p>
            </div>
          )}

          {/* Footer Image */}
          {settings.show_footer_image && settings.footer_image_url && (
            <div className="flex justify-center">
              <Image
                src={settings.footer_image_url}
                alt="Footer"
                width={400}
                height={60}
                className="max-h-16 w-auto object-contain"
              />
            </div>
          )}

          {/* Signature Section */}
          <div
            data-invoice-signature="true"
            className="grid grid-cols-3 gap-8 pt-16 mt-8"
          >
            <div className="text-center">
              <div className="border-t border-slate-900 pt-2">
                <p className="text-sm font-semibold">Prepared By</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-900 pt-2">
                <p className="text-sm font-semibold">Received By</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-900 pt-2">
                <p className="text-sm font-semibold">Authorised By</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
