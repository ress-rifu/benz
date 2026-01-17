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
        <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-lg border bg-white">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {services.map((service: any) => (
                    <div key={service.id} className="rounded-lg border bg-white p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                                <p className="font-medium text-slate-900">{service.name}</p>
                                {service.name_bn && (
                                    <p className="text-sm text-slate-500">{service.name_bn}</p>
                                )}
                            </div>
                            <ServiceActions service={service} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {service.service_categories?.name || "Uncategorized"}
                            </Badge>
                            {service.duration_minutes && (
                                <span className="text-xs text-slate-500">
                                    {service.duration_minutes} min
                                </span>
                            )}
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-right font-semibold text-slate-900">
                                {formatCurrency(service.price)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
