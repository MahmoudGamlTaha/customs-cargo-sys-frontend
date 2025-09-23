import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useCallback } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "./icons";
import { IPagination } from "@/pages/staff/StaffDocumentsPage";

interface PaginationProps {
  totalItems?: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const Pagination = ({ totalItems, onPageChange }: PaginationProps) => {
  console.log(totalItems, "Total Items");
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      onPageChange(newPage, pageSize);
    },
    [pageSize, totalPages, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (e) => {
      const newSize = parseInt(e.target.value, 10);
      setPageSize(newSize);
      setPage(1); // reset to first page
      onPageChange(1, newSize);
    },
    [onPageChange]
  );

  // useEffect(() => {
  //   if (paging) {
  //     setPage(paging.pageNumber);
  //     setPageSize(paging.pageSize);
  //   }
  // }, [paging]);

  return (
    <div className="my-3 flex items-center justify-between gap-4 p-4 border rounded-lg">
      {/* Page size dropdown */}
      <div>
        <label className="mr-2 text-sm ml-2">
          {t("pagination.rowPerPage")}:
        </label>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border rounded px-2 py-1 dark:bg-gray-600"
        >
          {[5, 10, 20, 50]?.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full p-1 border disabled:opacity-50 bg-red-600 text-white text-sm"
        >
          <div className="flex justift-center items-center">
            {/* {t("pagination.prev")} */}
            <span>
              <ArrowRightIcon />
            </span>
          </div>
        </button>

        {/* Page numbers */}
        <span className="text-sm">
          {t("pagination.page")} <span className="font-bold">{page}</span>{" "}
          {t("pagination.of")} {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-full p-1 border disabled:opacity-50 bg-green-600 text-white text-sm"
        >
          <div className="flex justift-center items-center">
            {/* {t("pagination.next")} */}
            <span>
              <ArrowLeftIcon />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Pagination;