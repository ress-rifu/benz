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
import { getServicesWithCategories } from "./actions";
import { ServiceActions } from "./service-actions";

export async function ServicesTable() {
    const services = await getServicesWithCategories();

    if (services.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">No services yet</p>
                <p className="mt-1 text-sm text-slate-400">
                    Add your first service to get started
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
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price (৳)</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map((service: any) => (
                        <TableRow key={service.id}>
                            <TableCell>
                                <div>
                                    <span className="font-medium">{service.name}</span>
                                    {service.name_bn && (
                                        <span className="ml-2 text-sm text-slate-500">
                                            ({service.name_bn})
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {service.service_categories?.name || "Uncategorized"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(service.price)}
                            </TableCell>
                            <TableCell className="text-right text-slate-500">
                                {service.duration_minutes
                                    ? `${service.duration_minutes} min`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <ServiceActions service={service} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
