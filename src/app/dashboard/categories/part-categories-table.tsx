import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPartCategories } from "./actions";
import { PartCategoryActions } from "./part-category-actions";

interface PartCategoriesTableProps {
    isSuperAdmin: boolean;
}

export async function PartCategoriesTable({ isSuperAdmin }: PartCategoriesTableProps) {
    const categories = await getPartCategories();

    if (categories.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">No part categories yet</p>
                {isSuperAdmin && (
                    <p className="mt-1 text-sm text-slate-400">
                        Add your first part category to get started
                    </p>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
                {categories.map((category: any) => (
                    <div key={category.id} className="rounded-lg border bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900">{category.name}</p>
                                {category.name_bn && (
                                    <p className="text-sm text-slate-500">{category.name_bn}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {category.is_active ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 shrink-0">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 shrink-0">
                                        Inactive
                                    </Badge>
                                )}
                                {isSuperAdmin && <PartCategoryActions category={category} />}
                            </div>
                        </div>
                        {category.description && (
                            <p className="mt-2 text-sm text-slate-500 line-clamp-2">{category.description}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border bg-white overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px]">Name (English)</TableHead>
                            <TableHead className="min-w-[120px]">Name (Bengali)</TableHead>
                            <TableHead className="min-w-[200px]">Description</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            {isSuperAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category: any) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="text-slate-500">
                                    {category.name_bn || "-"}
                                </TableCell>
                                <TableCell className="text-slate-500 max-w-[200px] truncate">
                                    {category.description || "-"}
                                </TableCell>
                                <TableCell>
                                    {category.is_active ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                {isSuperAdmin && (
                                    <TableCell>
                                        <PartCategoryActions category={category} />
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
