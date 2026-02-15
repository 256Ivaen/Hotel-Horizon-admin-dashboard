import React from 'react';

interface Column<T> {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => React.ReactNode;
}

interface Action<T> {
    label: string;
    onClick: (row: T) => void;
    className?: string;
    icon?: React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: Action<T>[];
    isDarkMode?: boolean;
    maxRows?: number;
}

const DataTable = <T,>({
    columns,
    data,
    actions,
    isDarkMode = false,
    maxRows
}: DataTableProps<T>) => {
    const hasActions = actions && actions.length > 0;
    const displayData = maxRows ? data.slice(0, maxRows) : data;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className={`border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`py-3 px-4 text-xs font-semibold tracking-wide ${
                                    isDarkMode ? 'text-primary/80' : 'text-primary'
                                } ${
                                    column.align === 'right'
                                        ? 'text-right'
                                        : column.align === 'center'
                                        ? 'text-center'
                                        : 'text-left'
                                }`}
                            >
                                {column.label}
                            </th>
                        ))}
                        {hasActions && (
                            <th className={`py-3 px-4 text-xs font-semibold tracking-wide text-right ${
                                isDarkMode ? 'text-primary/80' : 'text-primary'
                            }`}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((row, index) => (
                        <tr
                            key={index}
                            className={`border-b transition-colors ${
                                isDarkMode
                                    ? 'border-gray-700/50 hover:bg-gray-700/30'
                                    : 'border-gray-100 hover:bg-gray-50/50'
                            } last:border-0`}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`py-3.5 px-4 ${
                                        column.align === 'right'
                                            ? 'text-right'
                                            : column.align === 'center'
                                            ? 'text-center'
                                            : 'text-left'
                                    }`}
                                >
                                    {column.render
                                        ? column.render((row as any)[column.key], row)
                                        : (
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {(row as any)[column.key]}
                                            </span>
                                        )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
