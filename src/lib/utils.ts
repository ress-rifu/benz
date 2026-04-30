import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date))
}

function businessDateParts(now: Date = new Date()): { yy: string; mm: string; dd: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value
      return acc
    }, {})
  return { yy: parts.year.slice(-2), mm: parts.month, dd: parts.day }
}

export function generateInvoiceNumber(): string {
  const { yy, mm, dd } = businessDateParts()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${yy}${mm}${dd}-${random}`
}

export function generateQuotationNumber(): string {
  const { yy, mm, dd } = businessDateParts()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `QTN-${yy}${mm}${dd}-${random}`
}
