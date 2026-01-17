"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PartBrandActions } from "./part-brand-actions";
import type { Tables } from "@/types/database";

interface PartBrand extends Tables<"part_brands"> {
    part_categories: {
        id: string;
        name: string;
        name_bn: string | null;
    } | null;
}

interface PartBrandsTableProps {
    brands: PartBrand[];
    categories: Tables<"part_categories">[];
    isSuperAdmin: boolean;
}

export function PartBrandsTable({ brands, categories, isSuperAdmin }: PartBrandsTableProps) {
    if (brands.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">No part brands yet</p>
                {isSuperAdmin && (
                    <p className="mt-1 text-sm text-slate-400">
                        Add your first part brand to get started
                    </p>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
                {brands.map((brand) => (
                    <div key={brand.id} className="rounded-lg border bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900">{brand.name}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {brand.part_categories ? (
                                        <Badge variant="outline" className="text-xs">
                                            {brand.part_categories.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">Unassigned</span>
                                    )}
                                    {brand.country_of_origin && (
                                        <span className="text-xs text-slate-500">{brand.country_of_origin}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {brand.is_active ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 shrink-0">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 shrink-0">
                                        Inactive
                                    </Badge>
                                )}
                                {isSuperAdmin && <PartBrandActions brand={brand} categories={categories} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border bg-white overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px]">Brand Name</TableHead>
                            <TableHead className="min-w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[150px]">Country of Origin</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            {isSuperAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand) => (
                            <TableRow key={brand.id}>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>
                                    {brand.part_categories ? (
                                        <Badge variant="outline">
                                            {brand.part_categories.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {brand.country_of_origin || "-"}
                                </TableCell>
                                <TableCell>
                                    {brand.is_active ? (
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
                                        <PartBrandActions brand={brand} categories={categories} />
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
