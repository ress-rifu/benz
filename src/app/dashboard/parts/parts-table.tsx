import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getPartsWithRelations } from "./actions";
import { PartActions } from "./part-actions";

export async function PartsTable() {
    const parts = await getPartsWithRelations();

    if (parts.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">No parts yet</p>
                <p className="mt-1 text-sm text-slate-400">
                    Add your first part to get started
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU / Part #</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Price (৳)</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parts.map((part: any) => {
                        const isLowStock = part.quantity < (part.min_stock_level || 5);

                        return (
                            <TableRow key={part.id}>
                                <TableCell>
                                    <div>
                                        <span className="font-medium">{part.name}</span>
                                        {part.name_bn && (
                                            <span className="ml-2 text-sm text-slate-500">
                                                ({part.name_bn})
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono text-sm">
                                        <div className="text-slate-900">{part.sku}</div>
                                        {part.part_number && (
                                            <div className="text-xs text-slate-500">{part.part_number}</div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {part.part_categories?.name || "Uncategorized"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {part.part_brands?.name || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isLowStock ? (
                                        <Badge variant="destructive" className="animate-pulse">
                                            {part.quantity} Low
                                        </Badge>
                                    ) : (
                                        <span className="font-medium">{part.quantity}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(part.selling_price)}
                                </TableCell>
                                <TableCell>
                                    <PartActions part={part} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
