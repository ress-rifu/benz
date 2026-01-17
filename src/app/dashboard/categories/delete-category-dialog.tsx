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
import { deleteServiceCategory, deletePartCategory } from "./actions";

interface DeleteCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: {
        id: string;
        name: string;
    };
    type: "service" | "part";
}

export function DeleteCategoryDialog({
    open,
    onOpenChange,
    category,
    type,
}: DeleteCategoryDialogProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = type === "service"
                ? await deleteServiceCategory(category.id)
                : await deletePartCategory(category.id);

            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `${type === "service" ? "Service" : "Part"} category deleted successfully`,
                });
                onOpenChange(false);
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{category.name}&quot;? This
                        action cannot be undone. All {type === "service" ? "services" : "parts"}
                        using this category will need to be updated.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
