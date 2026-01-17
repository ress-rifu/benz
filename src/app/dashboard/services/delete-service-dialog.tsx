"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { deactivateService } from "./actions";
import type { Tables } from "@/types/database";

interface DeactivateServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Tables<"services">;
}

export function DeactivateServiceDialog({
    open,
    onOpenChange,
    service,
}: DeactivateServiceDialogProps) {
    const [isPending, startTransition] = useTransition();

    const handleDeactivate = () => {
        startTransition(async () => {
            const result = await deactivateService(service.id);

            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Service deactivated successfully",
                });
                onOpenChange(false);
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Service</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to deactivate &quot;{service.name}&quot;?
                        The service will be hidden from lists but preserved in the system for historical records.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeactivate}
                        disabled={isPending}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Deactivate
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Keep the old export name for backward compatibility
export { DeactivateServiceDialog as DeleteServiceDialog };
