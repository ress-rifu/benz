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
        <div className="rounded-lg border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name (English)</TableHead>
                        <TableHead>Name (Bengali)</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
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
    );
}
