import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { getSalesData } from "./actions";
import { SalesContent } from "./sales-content";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function SalesPage({ searchParams }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { filter: rawFilter = "month", q } = await searchParams;

  // Fall back to "month" if custom filter is set without date range in URL
  const filter = rawFilter === "custom" ? "month" : rawFilter;

  // Fetch initial data and parts/services lists in parallel
  const supabase = await createClient();
  const [initialData, partsResult, servicesResult] = await Promise.all([
    getSalesData(
      filter as "today" | "week" | "month" | "all" | "custom",
      undefined,
      q
    ),
    supabase.from("parts").select("id, name").eq("is_active", true).order("name"),
    supabase.from("services").select("id, name").eq("is_active", true).order("name"),
  ]);

  const parts = partsResult.data || [];
  const services = servicesResult.data || [];

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      }
    >
      <SalesContent
        initialData={initialData}
        initialFilter={filter as "today" | "week" | "month" | "all" | "custom"}
        initialSearch={q}
        parts={parts}
        services={services}
      />
    </Suspense>
  );
}
