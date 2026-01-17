import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoriesTable } from "./service-categories-table";
import { PartCategoriesTable } from "./part-categories-table";
import { CategoriesHeader } from "./categories-header";
import { getUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
    const user = await getUser();
    
    if (!user) {
        redirect("/login");
    }
    
    const isSuperAdmin = user.role === "super_admin";

    return (
        <div className="space-y-6">
            <CategoriesHeader isSuperAdmin={isSuperAdmin} />

            <Tabs defaultValue="services" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="services">Service Categories</TabsTrigger>
                    <TabsTrigger value="parts">Part Categories</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
