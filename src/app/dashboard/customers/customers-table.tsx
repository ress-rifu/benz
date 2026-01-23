import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCustomers } from "./actions";
import { CustomerActions } from "./customer-actions";
import { AlertTriangle, DollarSign } from "lucide-react";

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 2,
    }).format(amount).replace("BDT", "BDT ");
}

export async function CustomersTable({ searchQuery }: { searchQuery?: string }) {
    const customers = await getCustomers(searchQuery);

    if (customers.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">{searchQuery ? "No customers found" : "No customers yet"}</p>
                <p className="mt-1 text-sm text-slate-400">
                    {searchQuery ? "Try a different search term" : "Add your first customer to get started"}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Total Due</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer: any) => (
                            <TableRow 
                                key={customer.id}
                                className={customer.has_outstanding ? "bg-orange-50/50" : ""}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {customer.has_outstanding && (
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        )}
                                        {customer.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {customer.phone || "-"}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {customer.email || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {customer.total_due > 0 ? (
                                        <div className="flex items-center justify-end gap-1">
                                            <Badge 
                                                variant="secondary" 
                                                className="bg-orange-500 text-white hover:bg-orange-600"
                                            >
                                                {formatCurrency(customer.total_due)}
                                            </Badge>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {customer.is_active ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <CustomerActions customer={customer} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {customers.map((customer: any) => (
                    <div 
                        key={customer.id} 
                        className={`rounded-lg border bg-white p-4 space-y-3 ${
                            customer.has_outstanding ? "border-orange-300 bg-orange-50/30" : ""
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {customer.has_outstanding && (
                                        <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                                    )}
                                    <p className="font-medium text-slate-900">{customer.name}</p>
                                </div>
                                {customer.phone && (
                                    <p className="text-sm text-slate-500">{customer.phone}</p>
                                )}
                                {customer.email && (
                                    <p className="text-sm text-slate-500 truncate">{customer.email}</p>
                                )}
                            </div>
                            <CustomerActions customer={customer} />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex gap-2">
                                {customer.is_active ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                                        Inactive
                                    </Badge>
                                )}
                            </div>
                            {customer.total_due > 0 && (
                                <Badge 
                                    variant="secondary" 
                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                >
                                    Due: {formatCurrency(customer.total_due)}
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
