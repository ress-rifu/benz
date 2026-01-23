import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { getSalesData } from "./actions";
import { SalesContent } from "./sales-content";

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function SalesPage({ searchParams }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { filter = "month", q } = await searchParams;

  // Default to showing this month's data
  const initialData = await getSalesData(
    filter as "today" | "week" | "month" | "custom",
    undefined,
    q
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      }
    >
      <SalesContent initialData={initialData} initialFilter={filter as "today" | "week" | "month" | "custom"} initialSearch={q} />
    </Suspense>
  );
}
