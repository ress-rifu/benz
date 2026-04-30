export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PaginationParams {
    page: number;
    pageSize: number;
    from: number;
    to: number;
}

export function parsePagination(
    sp: { page?: string; pageSize?: string },
    options?: { pageKey?: string; sizeKey?: string }
): PaginationParams {
    const pageRaw = options?.pageKey
        ? (sp as Record<string, string | undefined>)[options.pageKey]
        : sp.page;
    const sizeRaw = options?.sizeKey
        ? (sp as Record<string, string | undefined>)[options.sizeKey]
        : sp.pageSize;

    const sizeNum = Number(sizeRaw);
    const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(sizeNum)
        ? sizeNum
        : DEFAULT_PAGE_SIZE;
    const page = Math.max(1, Number(pageRaw) || 1);
    return {
        page,
        pageSize,
        from: (page - 1) * pageSize,
        to: page * pageSize - 1,
    };
}

export function clampPage(page: number, total: number, pageSize: number): number {
    if (total <= 0) return 1;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    return Math.min(Math.max(1, page), lastPage);
}
