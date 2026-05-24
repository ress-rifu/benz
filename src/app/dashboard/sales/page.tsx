import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import { getSalesData } from "./actions";
import { SalesContent } from "./sales-content";
import { createClient } from "@/lib/supabase/server";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SalesPage({ searchParams }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const sp = await searchParams;
  const { filter: rawFilter = "month", q } = sp;
  const filter = rawFilter === "custom" ? "month" : rawFilter;
  const { page, pageSize, from, to } = parsePagination(sp);

  const supabase = await createClient();
  const [initialData, partsResult, servicesResult] = await Promise.all([
    getSalesData(
      filter as "today" | "week" | "month" | "all" | "custom",
      undefined,
      q,
      undefined,
      { from, to }
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
        initialPage={page}
        initialPageSize={pageSize}
        parts={parts}
        services={services}
      />
    </Suspense>
  );
}
