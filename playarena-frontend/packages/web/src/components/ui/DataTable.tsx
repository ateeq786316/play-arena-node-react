import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@playarena/shared/utils";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

export interface DataColumn<T> {
  key: keyof T | string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyState?: ReactNode;
  emptyTitle?: string;
  rowCount?: number;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
}

export function DataTable<T>({
  columns,
  rows,
  keyField,
  loading = false,
  emptyState,
  emptyTitle = "No records found",
  rowCount = 6,
  page,
  pageCount,
  onPageChange,
  onSort,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (!onSort) return;
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    onSort(key, nextDir);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              {columns.map((col, j) => (
                <Skeleton key={String(col.key)} className={cn("h-4", j === 0 ? "w-1/4" : "w-16")} />
              ))}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyState}
        className="p-10 text-center"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="sticky top-0 border-b border-border bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn("whitespace-nowrap px-4 py-3 font-medium text-muted-foreground", col.sortable && "cursor-pointer select-none", col.className)}
                    onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                    aria-sort={
                      col.sortable && sortKey === col.key
                        ? sortDir === "asc" ? "ascending" : "descending"
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={String(row[keyField])} className="transition-colors hover:bg-muted/40">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={cn("px-4 py-3", col.className)}>
                      {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {page !== undefined && pageCount !== undefined && onPageChange && (
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      )}
    </div>
  );
}
