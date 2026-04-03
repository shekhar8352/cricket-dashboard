"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onItemsPerPageChange,
    showItemsPerPage = true,
    itemsPerPageOptions = [5, 10, 20, 50],
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis");
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis");
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Items per page selector */}
            {showItemsPerPage && onItemsPerPageChange && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="h-9 cursor-pointer rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option} className="bg-card">
                                {option}
                            </option>
                        ))}
                    </select>
                    <span>per page</span>
                </div>
            )}

            {/* Page info */}
            <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">{startItem}</span> to{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">{endItem}</span> of{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">{totalItems}</span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    title="First page"
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Previous page button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    title="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) =>
                        page === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-h-9 min-w-9 rounded-md px-3 text-sm font-medium transition-colors ${
                                    currentPage === page
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                {/* Next page button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    title="Next page"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    title="Last page"
                >
                    <ChevronsRight size={18} />
                </button>
            </div>
        </div>
    );
}

// Helper hook for pagination logic
export function usePagination<T>(items: T[], initialItemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Use Effect to handle page out of bounds when items change
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return {
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage: handleItemsPerPageChange,
        totalPages,
        paginatedItems,
        totalItems: items.length,
    };
}
