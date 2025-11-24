import React, { ReactNode } from 'react';

export interface DataTableColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    /** Optional actions column (e.g., edit/delete) */
    actions?: (item: T) => ReactNode;
}

/**
 * Generic reusable table component.
 *
 * - Renders a header row based on `columns`.
 * - For each data row, renders cells using either the accessor string or a custom render function.
 * - Supports a loading state and an empty state.
 * - Allows an optional actions column for row‑level buttons.
 */
export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available.',
    actions,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions && (
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                            {columns.map((col, colIdx) => {
                                const value =
                                    typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : item[col.accessor as keyof T];
                                const cellContent = col.render ? col.render(item) : value;
                                return (
                                    <td
                                        key={colIdx}
                                        className="px-4 py-2 text-sm text-gray-800"
                                    >
                                        {cellContent}
                                    </td>
                                );
                            })}
                            {actions && (
                                <td className="px-4 py-2 text-sm text-gray-800">
                                    {actions(item)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
