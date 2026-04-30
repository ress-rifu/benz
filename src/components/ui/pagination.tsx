"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    pageSizeOptions?: readonly number[];
    /** URL param name used for the current page. Defaults to "page". */
    pageKey?: string;
    /** URL param name used for the page size. Defaults to "pageSize". */
    sizeKey?: string;
    className?: string;
}

function buildPageList(current: number, last: number): (number | "...")[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < last - 1) pages.push("...");
    pages.push(last);
    return pages;
}

export function Pagination({
    total,
    page,
    pageSize,
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    pageKey = "page",
    sizeKey = "pageSize",
    className,
}: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), lastPage);
    const startRow = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const endRow = Math.min(safePage * pageSize, total);

    const pushParams = useCallback(
        (mutate: (p: URLSearchParams) => void) => {
            const params = new URLSearchParams(searchParams.toString());
            mutate(params);
            const qs = params.toString();
            startTransition(() => {
                router.push(qs ? `${pathname}?${qs}` : pathname);
            });
        },
        [router, pathname, searchParams]
    );

    const goToPage = useCallback(
        (next: number) => {
            const target = Math.min(Math.max(1, next), lastPage);
            if (target === safePage) return;
            pushParams((p) => {
                if (target === 1) p.delete(pageKey);
                else p.set(pageKey, String(target));
            });
        },
        [pushParams, safePage, lastPage, pageKey]
    );

    const changePageSize = useCallback(
        (value: string) => {
            const next = Number(value);
            pushParams((p) => {
                p.set(sizeKey, String(next));
                p.delete(pageKey);
            });
        },
        [pushParams, sizeKey, pageKey]
    );

    if (total === 0) return null;

    const pageItems = buildPageList(safePage, lastPage);

    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                isPending && "opacity-70",
                className
            )}
        >
            <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>
                    Showing <span className="font-medium">{startRow}</span>–
                    <span className="font-medium">{endRow}</span> of{" "}
                    <span className="font-medium">{total}</span>
                </span>
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-slate-500">Rows</span>
                    <Select value={String(pageSize)} onValueChange={changePageSize}>
                        <SelectTrigger className="h-8 w-[80px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((opt) => (
                                <SelectItem key={opt} value={String(opt)}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(1)}
                    disabled={safePage === 1 || isPending}
                    aria-label="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1 || isPending}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="hidden md:flex items-center gap-1 mx-1">
                    {pageItems.map((p, idx) =>
                        p === "..." ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-2 text-sm text-slate-400 select-none"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={p}
                                variant={p === safePage ? "default" : "outline"}
                                size="sm"
                                className="h-8 min-w-8 px-2"
                                onClick={() => goToPage(p)}
                                disabled={isPending}
                            >
                                {p}
                            </Button>
                        )
                    )}
                </div>

                <span className="md:hidden px-2 text-sm text-slate-600">
                    Page {safePage} of {lastPage}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === lastPage || isPending}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(lastPage)}
                    disabled={safePage === lastPage || isPending}
                    aria-label="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
