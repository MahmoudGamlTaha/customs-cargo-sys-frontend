import React, { useState, useEffect } from "react";
import { useLanguage, TranslationKey } from "../contexts/LanguageContext";
import { formatDate } from "../utils/dateUtils";

// Types for table configuration
export interface TableColumn<T = any> {
  key: string;
  header: string;
  translationKey?: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  translationKey?: string | ((item: T) => string);
  onClick: (item: T, event: React.MouseEvent) => void;
  className?: string | ((item: T) => string);
  icon?: React.ReactNode;
  condition?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
  loading?: (item: T) => boolean;
  loadingText?: string;
  loadingTextTranslationKey?: string;  
}

export interface StandardTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  loadingText?: string;
  loadingTextTranslationKey?: string;
  emptyText?: string;
  emptyTextTranslationKey?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T) => void;
  processingItemId?: string | number;
  showRowNumbers?: boolean;
  rowNumberHeader?: string;
  rowNumberHeaderTranslationKey?: string;
  // New props for complete external control
  showActionsColumn?: boolean;
  actionsColumnHeader?: string;
  actionsColumnHeaderTranslationKey?: string;
  actionsColumnClassName?: string;
  actionsContainerClassName?: string;
  actionButtonClassName?: string;
  loadingSpinnerClassName?: string;
  emptyStateClassName?: string;
  errorStateClassName?: string;
  tableWrapperClassName?: string;
}

export const StandardTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  loadingText = "جاري التحميل...",
  loadingTextTranslationKey = "common.loading",
  emptyText = "لا توجد بيانات",
  emptyTextTranslationKey = "common.noData",
  className = "",
  tableClassName = "w-full",
  headerClassName = "",
  rowClassName = "border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
  onRowClick,
  processingItemId,
  showRowNumbers = false,
  rowNumberHeader = "#",
  rowNumberHeaderTranslationKey = "common.rowNumber",
  // New props with defaults
  showActionsColumn = actions?.length > 0,
  actionsColumnHeader = "actions",
  actionsColumnHeaderTranslationKey = "common.action",
  actionsColumnClassName = "py-3 px-4",
  actionsContainerClassName = "flex flex-row items-center justify-center flex-wrap gap-2",
  actionButtonClassName = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
  loadingSpinnerClassName = "w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin",
  emptyStateClassName = "text-center py-8 text-gray-500",
  errorStateClassName = "text-center py-8 text-red-500",
  tableWrapperClassName = "overflow-x-auto",
}: StandardTableProps<T>) => {
  const { t } = useLanguage();
  
  // State to track document direction
  const [isRTL, setIsRTL] = useState(() => document.documentElement.dir === 'rtl');
  
  // Effect to monitor direction changes
  useEffect(() => {
    const checkDirection = () => {
      const currentDirection = document.documentElement.dir === 'rtl';
      setIsRTL(currentDirection);
      console.log("🌍 StandardTable - Document direction:", document.documentElement.dir);
      console.log("🌍 StandardTable - isRTL:", currentDirection);
      console.log("🌍 StandardTable - Actions text will be:", currentDirection ? "الإجراءات" : "ACTIONS");
    };
    
    // Check initial direction
    checkDirection();
    
    // Create a MutationObserver to watch for changes to the document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'dir') {
          checkDirection();
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  // Helper function to get translation with better fallback
  const getTranslation = (key: string, fallback: string): string => {
    try {
      const translation = t(key);
      
      // If translation is the same as key, it means translation not found
      if (translation === key || !translation || translation.trim() === '') {
        return fallback;
      }
      
      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return fallback;
    }
  };

  // Helper function to get row class name
  const getRowClassName = (item: T, index: number): string => {
    const baseClass =
      typeof rowClassName === "function"
        ? rowClassName(item, index)
        : rowClassName;
    const clickableClass = onRowClick ? "cursor-pointer" : "";
    return `${baseClass} ${clickableClass}`.trim();
  };

  // Helper function to handle row click
  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Helper function to render cell content
  const renderCellContent = (
    column: TableColumn<T>,
    item: T,
    index: number
  ): React.ReactNode => {
    if (column.render) {
      return column.render(item, index);
    }

    // Default rendering based on column key
    const value = item[column.key];

    if (value === null || value === undefined) {
      return "-";
    }

    // Handle different data types
    if (
      column.key.toLowerCase().includes("date") ||
      column.key.toLowerCase().includes("createdat") ||
      column.key.toLowerCase().includes("updatedat")
    ) {
      return formatDate(value);
    }

    if (
      column.key.toLowerCase().includes("amount") ||
      column.key.toLowerCase().includes("fee") ||
      column.key.toLowerCase().includes("price")
    ) {
      return typeof value === "number" ? value.toLocaleString() : value;
    }

    return value;
  };

  // Helper function to render action button
  const renderActionButton = (
    action: TableAction<T>,
    item: T,
    index: number
  ): React.ReactNode => {
    const isDisabled = action.disabled ? action.disabled(item) : false;
    const isLoading = action.loading ? action.loading(item) : false;
    const shouldShow = action.condition ? action.condition(item) : true;

    if (!shouldShow) {
      return null;
    }

    const buttonText =
      isLoading && action.loadingTextTranslationKey
        ? getTranslation(
            action.loadingTextTranslationKey,
            action.loadingText || "جاري المعالجة..."
          )
        : getTranslation(
            typeof action.translationKey === 'function' 
              ? action.translationKey(item)
              : action.translationKey || action.label, 
            action.label
          );

    return (
      <button
        key={action.key}
        onClick={(e) => action.onClick(item, e)}
        disabled={isDisabled || isLoading}
        className={`${actionButtonClassName} ${
          isDisabled || isLoading
            ? "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
            : typeof action.className === 'function' 
              ? action.className(item)
              : action.className ||
                "bg-brand-lighter/20 text-brand-primary hover:bg-brand-primary/20 hover:shadow-sm border-2 border-brand-primary hover:border-brand-primary-dark"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {buttonText}
          </>
        ) : (
          <>
            {action.icon}
            {buttonText}
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`${tableWrapperClassName} ${className} w-full overflow-y-auto touch-pan-x`}>
      <table className={tableClassName}>
        <thead>
          <tr className={`${headerClassName} border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-600`}>
            {showRowNumbers && (
              <th className="py-3 px-4 w-12">
                {getTranslation(rowNumberHeaderTranslationKey, rowNumberHeader)}
              </th>
            )}
            {columns?.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-4 ${column.headerClassName || ""}`}
                style={{ width: column.width }}
              >
                {column.translationKey
                  ? getTranslation(column.translationKey, column.header)
                  : column.header}
              </th>
            ))}
            {showActionsColumn && (
              <th className={actionsColumnClassName}>
                {isRTL ? "الإجراءات" : "ACTIONS"}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={
                  columns?.length +
                  (showRowNumbers ? 1 : 0) +
                  (showActionsColumn ? 1 : 0)
                }
                className={emptyStateClassName}
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {getTranslation(loadingTextTranslationKey, loadingText)}
                </div>
              </td>
            </tr>
          ) : data?.length > 0 ? (
            data?.map((item, index) => (
              <tr
                key={item.id || index}
                className={`${getRowClassName(item, index)} hover:bg-gray-100/50 cursor-pointer border-b-[1px] border-solid border-gray-200/50 dark:border-gray-500/50 `}
                onClick={() => handleRowClick(item)}
              >
                {showRowNumbers && (
                  <td className="py-3 px-4 text-gray-500 font-medium text-center">
                    {index + 1}
                  </td>
                )}
                {columns?.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3 px-4 ${column.className || ""}`}
                  >
                    {renderCellContent(column, item, index)}
                  </td>
                ))}
                {showActionsColumn && (
                  <td className={actionsColumnClassName}>
                    <div className={actionsContainerClassName}>
                      {actions?.map((action) =>
                        renderActionButton(action, item, index)
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns?.length +
                  (showRowNumbers ? 1 : 0) +
                  (showActionsColumn ? 1 : 0)
                }
                className={emptyStateClassName}
              >
                {getTranslation(emptyTextTranslationKey, emptyText)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StandardTable;