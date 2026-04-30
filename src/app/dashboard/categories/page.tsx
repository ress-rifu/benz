import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoriesTable } from "./service-categories-table";
import { PartCategoriesTable } from "./part-categories-table";
import { PartBrandsTable } from "./part-brands-table";
import { CategoriesHeader } from "./categories-header";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { getPartCategories, getPartBrandsPaged } from "./actions";
import { parsePagination } from "@/lib/pagination";

interface PageProps {
    searchParams: Promise<{
        servicesPage?: string;
        partsPage?: string;
        brandsPage?: string;
        pageSize?: string;
    }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
    const user = await getUser();

    if (!user) {
        redirect("/login");
    }

    const isSuperAdmin = user.role === "super_admin";

    const sp = await searchParams;

    const services = parsePagination(sp, { pageKey: "servicesPage", sizeKey: "pageSize" });
    const partsPg = parsePagination(sp, { pageKey: "partsPage", sizeKey: "pageSize" });
    const brandsPg = parsePagination(sp, { pageKey: "brandsPage", sizeKey: "pageSize" });

    const [categories, brandsResult] = await Promise.all([
        getPartCategories(),
        getPartBrandsPaged({ from: brandsPg.from, to: brandsPg.to }),
    ]);

    return (
        <div className="space-y-6">
            <CategoriesHeader isSuperAdmin={isSuperAdmin} categories={categories} />

            <Tabs defaultValue="services" className="space-y-4">
                <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto">
                    <TabsTrigger value="services" className="text-xs sm:text-sm py-2">Services</TabsTrigger>
                    <TabsTrigger value="parts" className="text-xs sm:text-sm py-2">Parts</TabsTrigger>
                    <TabsTrigger value="brands" className="text-xs sm:text-sm py-2">Brands</TabsTrigger>
                </TabsList>

                <TabsContent value="services">
                    <Suspense
                        key={`services-${services.page}-${services.pageSize}`}
                        fallback={<TableSkeleton columns={4} rows={Math.min(services.pageSize, 8)} />}
                    >
                        <ServiceCategoriesTable
                            isSuperAdmin={isSuperAdmin}
                            page={services.page}
                            pageSize={services.pageSize}
                        />
                    </Suspense>
                </TabsContent>

                <TabsContent value="parts">
                    <Suspense
                        key={`parts-${partsPg.page}-${partsPg.pageSize}`}
                        fallback={<TableSkeleton columns={4} rows={Math.min(partsPg.pageSize, 8)} />}
                    >
                        <PartCategoriesTable
                            isSuperAdmin={isSuperAdmin}
                            page={partsPg.page}
                            pageSize={partsPg.pageSize}
                        />
                    </Suspense>
                </TabsContent>

                <TabsContent value="brands">
                    <PartBrandsTable
                        brands={brandsResult.rows as any}
                        categories={categories}
                        isSuperAdmin={isSuperAdmin}
                        total={brandsResult.total}
                        page={brandsPg.page}
                        pageSize={brandsPg.pageSize}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
