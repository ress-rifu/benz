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

export async function CustomersTable() {
    const customers = await getCustomers();

    if (customers.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">No customers yet</p>
                <p className="mt-1 text-sm text-slate-400">
                    Add your first customer to get started
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
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer: any) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-slate-500">
                                {customer.phone || "-"}
                            </TableCell>
                            <TableCell className="text-slate-500">
                                {customer.email || "-"}
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
    );
}
