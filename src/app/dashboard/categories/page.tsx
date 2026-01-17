import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoriesTable } from "./service-categories-table";
import { PartCategoriesTable } from "./part-categories-table";
import { PartBrandsTable } from "./part-brands-table";
import { CategoriesHeader } from "./categories-header";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";
import { getPartCategories, getPartBrands } from "./actions";

export default async function CategoriesPage() {
    const user = await getUser();
    
    if (!user) {
        redirect("/login");
    }
    
    const isSuperAdmin = user.role === "super_admin";
    
    // Fetch data for brands tab
    const [categories, brands] = await Promise.all([
        getPartCategories(),
        getPartBrands(),
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
                    <Suspense fallback={<TableSkeleton columns={4} rows={8} />}>
                        <ServiceCategoriesTable isSuperAdmin={isSuperAdmin} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="parts">
                    <Suspense fallback={<TableSkeleton columns={4} rows={8} />}>
                        <PartCategoriesTable isSuperAdmin={isSuperAdmin} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="brands">
                    <PartBrandsTable 
                        brands={brands as any} 
                        categories={categories} 
                        isSuperAdmin={isSuperAdmin} 
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
