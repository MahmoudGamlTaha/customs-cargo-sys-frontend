import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLanguage,
  TranslationKey,
  getCurrentLanguage,
  getLanguageName,
} from "../../contexts/LanguageContext";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getRequestActivities,
  markAsPaid,
} from "../../services/requestService";
import {
  DocumentRequest,
  RequestStatus,
  UserRole,
  UserActivity,
} from "../../types";
import { formatDate } from "../../utils/dateUtils";
import Modal from "../../components/Modal";
import RequestDetailsModal from "../../components/RequestDetailsModal";
import Card from "../../components/Card";
import {
  StandardTable,
  TableColumn,
  TableAction,
} from "../../components/StandardTable";
import { getCurrentUser } from "../../services/authService";
import toast from "react-hot-toast";
import CustomSelect from "@/components/CustomSelect";
import { Branch, getBranches } from "@/services/branchService";
import { getToken } from "@/utils/getToken";
import { ProfileIcon } from "@/components/icons";
import Pagination from "@/components/Pagination";
import ReactDOM from 'react-dom';


/**
 * Formats a timestamp into a more readable format
 * @param timestamp ISO timestamp string
 * @returns Formatted date string
 */

const getStatusClass = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.ISSUED:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case RequestStatus.PAID:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case RequestStatus.REJECTED:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case RequestStatus.APPROVED:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

export interface IPagination {
  pageSize: number;
  pageNumber: number;
}
export const StaffDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t: getTranslation, language } = useLanguage();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "all" | "ISSUED">("all");
  const [currentUser, setCurrentUser] = useState<{
    role?: UserRole;
    accessToken?: string;
  } | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] =
    useState<DocumentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string | undefined>();
  const [showApiResponse, setShowApiResponse] = useState<boolean>(false);
  const [paging, setPaging] = useState<IPagination>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState<number>(0);
  const [userBranchId, setUserBranchId] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Get branch ID from localStorage for all roles except admin
    if (user?.role !== UserRole.Admin) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          console.log("User data from localStorage:", userObj);

          // Try different possible locations for branch ID
          let branchId =
            userObj.branchId || userObj.branch_id || userObj.branch?.id;

          if (branchId) {
            // Convert to number if it's a string
            const numericBranchId =
              typeof branchId === "string" ? parseInt(branchId, 10) : branchId;
            console.log("Setting userBranchId to:", numericBranchId);
            setUserBranchId(numericBranchId);
          } else {
            console.log(
              "No branchId found in user data. Available keys:",
              Object.keys(userObj)
            );
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      } else {
        console.log("No user data found in localStorage");
      }
    }
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      if (!user || !user.accessToken) {
        setError(
          getTranslation(
            "auth.required",
            "Authentication required. Please log in."
          )
        );
        setLoading(false);
        return;
      }

      const response = await getAllRequests(paging.pageSize, paging.pageNumber);

      if (response.success && response.data?.requests) {
        console.log(response.data.pagination, "DD");
        // setTotalRows()
        setRequests(response.data.requests as DocumentRequest[]);
        setTotalRows(response.data?.pagination?.total || 0);
      } else {
        setError(
          response.message ||
          getTranslation(
            "staffPages.messages.fetchError",
            "Failed to fetch requests"
          )
        );
      }
    } catch (err) {
      console.error(
        getTranslation(
          "staffPages.debug.fetchError",
          "Error fetching requests:"
        ),
        err
      );
      setError(
        getTranslation(
          "staffPages.messages.generalError",
          "An error occurred while fetching requests"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paging.pageSize || paging.pageNumber)
      fetchRequests();
  }, [paging.pageSize, paging.pageNumber]);

  // Fetch activities for the selected request
  const fetchRequestActivities = async (requestId: string) => {
    setLoadingActivities(true);
    setActivitiesError(null);

    try {
      if (!currentUser?.accessToken) {
        setActivitiesError("Authentication required. Please log in.");
        setLoadingActivities(false);
        return;
      }

      const response = await getRequestActivities(
        requestId,
        currentUser.accessToken
      );

      if (response.success && response.data.activities) {
        const activityData = response.data.activities || [];
        setActivities(Array.isArray(activityData) ? activityData : []);
      } else {
        setActivitiesError(
          response.message ||
          getTranslation(
            "staffPages.messages.activitiesError",
            "Failed to fetch activity logs"
          )
        );
      }
    } catch (err) {
      console.error(
        getTranslation(
          "staffPages.debug.activitiesError",
          "Error fetching activities:"
        ),
        err
      );
      setActivitiesError(
        getTranslation(
          "staffPages.messages.activitiesGeneralError",
          "An error occurred while fetching activity logs"
        )
      );
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleRowClick = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };
  const filteredRequests = useMemo(() => {
    return (
      requests?.filter((req) => {
        if (filter === "all" && (branchFilter === "all" || !branchFilter)) {
          return true;
        }
        if (filter === "all") {
          // status not filtered, but branch is
          return (
            branchFilter === "all" || req.branch_id === Number(branchFilter)
          );
        }
        if (branchFilter && branchFilter !== "all") {
          // both filters active
          return (
            req.status === filter && req.branch_id === Number(branchFilter)
          );
        }
        // only status filter active
        return req.status === filter;
      }) ?? []
    );
  }, [requests, filter, branchFilter]);

  const handleMarkAsPaid = async (
    requestId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!currentUser?.accessToken) return;

    setProcessingRequestId(requestId);

    try {
      const response = await markAsPaid(requestId, currentUser.accessToken);
      if (response.success) {
        const updatedRequests = requests?.map((req) =>
          req.id === requestId
            ? { ...req, status: RequestStatus.PAID }
            : req
        );
        setRequests(updatedRequests);
        toast.success(getTranslation(
          "staffPages.messages.successMsg",
          "Document marked as paid successfully"
        ));
      } else {
        toast.error(
          response.message ||
          getTranslation(
            "staffPages.messages.markAsPaidError",
            "Failed to mark document as paid"
          )
        );
      }
    } catch (error: any) {
      console.error(
        getTranslation(
          "staffPages.debug.markAsPaidError",
          "Error marking document as paid:"
        ),
        error
      );
      toast.error(
        error.message ||
        getTranslation(
          "staffPages.messages.markAsPaidError",
          "Failed to mark document as paid"
        )
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleApproveRequest = async (
    requestId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!currentUser?.accessToken) return;

    setProcessingRequestId(requestId);

    try {
      const response = await approveRequest(requestId, currentUser.accessToken);
      if (response.success) {
        const updatedRequests = requests?.map((req) =>
          req.id === requestId
            ? { ...req, status: RequestStatus.APPROVED }
            : req
        );
        setRequests(updatedRequests);
      } else {
        toast.error(
          response.message ||
          getTranslation(
            "staffPages.messages.approveError",
            "Failed to approve document"
          )
        );
      }
    } catch (error: any) {
      console.error(
        getTranslation(
          "staffPages.debug.approveError",
          "Error approving document:"
        ),
        error
      );
      toast.error(
        error.message ||
        getTranslation(
          "staffPages.messages.approveError",
          "Failed to approve document"
        )
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRejectRequestId(requestId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!currentUser?.accessToken || !rejectRequestId) return;

    setProcessingRequestId(rejectRequestId);

    try {
      const response = await rejectRequest(
        rejectRequestId,
        rejectionReason,
        currentUser.accessToken
      );

      if (response.success) {
        const updatedRequests = requests?.map((req) =>
          req.id === rejectRequestId
            ? { ...req, status: RequestStatus.REJECTED }
            : req
        );
        setRequests(updatedRequests);
        setShowRejectModal(false);
        setRejectionReason("");
        setRejectRequestId(null);
        toast.success(
          getTranslation(
            "staffPages.messages.documentRejected",
            "Document rejected successfully"
          )
        );
      } else {
        toast.error(
          response.message ||
          getTranslation(
            "staffPages.messages.rejectionError",
            "Failed to reject document"
          )
        );
      }
    } catch (error) {
      console.error(
        getTranslation(
          "staffPages.debug.rejectError",
          "Error rejecting document:"
        ),
        error
      );
      toast.error(
        getTranslation(
          "staffPages.messages.rejectionError",
          "Failed to reject document"
        )
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const filterOptions = [
    {
      value: RequestStatus.ISSUED,
      label: getTranslation("status.ISSUED", "Issued"),
    },
    { value: RequestStatus.PAID, label: getTranslation("status.Paid", "Paid") },
    {
      value: RequestStatus.APPROVED,
      label: getTranslation("status.APPROVED", "Approved"),
    },
    {
      value: RequestStatus.REJECTED,
      label: getTranslation("status.Rejected", "Rejected"),
    },
    { value: "all", label: getTranslation("staffPages.common.all", "All") },
  ];

  const getBranchName = useCallback(
    (branch_id): string => {
      return (
        branches.find((res) => res?.id === branch_id)?.name ||
        getTranslation("staffPages.common.unknown", "Unknown")
      );
    },
    [branches, getTranslation]
  );

  const getAllBranches = useCallback(async () => {
    const auth = getToken();
    const result = await getBranches(auth);
    if (result?.success) {
      console.log(
        result?.data?.data?.branches,
        getTranslation("staffPages.debug.branchesData", "result?.data?.data")
      );
      setBranches([
        { id: "all", name: getTranslation("staffPages.common.all", "All") },
        ...result?.data?.data?.branches,
      ]);
    }
  }, [getBranches]);

  useEffect(() => {
    getAllBranches();
  }, [getAllBranches]);

  // Define table columns configuration
  const columns: TableColumn<DocumentRequest>[] = [
    {
      key: "id",
      header: "ID",
      translationKey: "staffPages.table.id",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
          {item.id}
        </div>
      ),
    },
    {
      key: "serialNumber",
      header: "Serial #",
      translationKey: "staffPages.forms.serialNumber",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.serialNumber || item?.details[0]?.serial_number || "-"}
        </div>
      ),
    },
    {
      key: "branch_id",
      header: "Branch",
      translationKey: "staffPages.table.branch",
      render: (item) => (
        <div className="px-3 py-4 font-medium text-gray-900 dark:text-gray-200">
          {getBranchName(item?.branch_id)}
        </div>
      ),
    },
    {
      key: "ratio",
      header: "Ratio",
      translationKey: "staffPages.forms.ratio",
      render: (item) => (
        <div className="px-3 py-4 font-medium text-gray-900 dark:text-gray-200">
          {item?.ratio}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      translationKey: "staffPages.table.title",
      render: (item) => (
        <div className="max-w-[300px] truncate overflow-hidden text-ellipsis px-3 py-4 font-medium text-gray-900 dark:text-gray-200 text-center">
          {item.title}
        </div>
      ),
    },
    {
      key: "request_type_name",
      header: "Service Type",
      translationKey: "staffPages.table.serviceType",
      render: (item) => (
        // <div className="px-3 py-4 text-center">{item.request_type_name}</div>
        <div className="min-w-[120px] text-center text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
          {item.request_type_name || getTranslation(
            `data.serviceTypes.${item.serviceType}` as TranslationKey,
            item.serviceType
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      translationKey: "staffPages.table.status",
      render: (item) => (
        <div className="px-3 py-4 w-32 text-center">
          <span
            className={`px-3 py-1 text-xs font-semibold leading-tight rounded-full whitespace-nowrap ${getStatusClass(
              item.status
            )}`}
          >
            {getTranslation(
              `status.${item.status}` as TranslationKey,
              item.status
            )}
          </span>
        </div>
      ),
    },
    {
      key: "rejection_reason",
      header: "Rejected Reason",
      translationKey: "staffPages.table.rejectedReason",
      render: (item) => (
        <div className="px-3 py-4 text-center">
          {item?.rejection_reason || "-"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      translationKey: "staffPages.table.createdAt",
      render: (item) => (
        <div className="px-3 py-4 text-center">
          {formatDate(item.createdAt)}
        </div>
      ),
    },
  ];

  // Define table actions configuration
  const actions: TableAction<DocumentRequest>[] = [
    {
      key: "approve",
      label: "Approve",
      translationKey: "staffPages.forms.approve",
      onClick: (item, event) => handleApproveRequest(item.id, event),
      condition: (item) =>
        (currentUser?.role === UserRole.Auditor ||
          currentUser?.role === UserRole.BranchAdmin) &&
        item.status === RequestStatus.ISSUED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "staffPages.common.processing",
      className:
        "px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    // Reject action (for auditor and branch admin)
    {
      key: "reject",
      label: "Reject",
      translationKey: "staffPages.forms.reject",
      onClick: (item, event) => handleRejectRequest(item.id, event),
      condition: (item) =>
        (currentUser?.role === UserRole.Auditor ||
          currentUser?.role === UserRole.BranchAdmin) &&
        item.status === RequestStatus.ISSUED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "staffPages.common.processing",
      className:
        "px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    // Mark as Paid action (for accountant when approved)
    {
      key: "markAsPaid",
      label: getTranslation("accountantPages.actions.markAsPaid", "Mark as Paid"),
      translationKey: "accountantPages.actions.markAsPaid",
      onClick: (item, event) => handleMarkAsPaid(item.id, event),
      condition: (item) =>
      (currentUser?.role === UserRole.BranchAdmin &&
        item.status === RequestStatus.APPROVED),
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "staffPages.common.processing",
      className:
        "px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    // Reject action (for accountant when approved)
    {
      key: "rejectApproved",
      label: "Reject",
      translationKey: "staffPages.forms.reject",
      onClick: (item, event) => handleRejectRequest(item.id, event),
      condition: (item) =>
        currentUser?.role === UserRole.Accountant &&
        item.status === RequestStatus.APPROVED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "staffPages.common.processing",
      className:
        "px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    // Print action (for staff and branch admin when paid)
    {
      key: "print",
      label: "Print",
      translationKey: "certs.print",
      onClick: (item, event) => {
        event.stopPropagation();
        console.log(
          getTranslation(
            "staffPages.debug.printClicked",
            "Print button clicked"
          ),
          item
        );

        const serviceTypeId = String(item.serviceTypeId);
        if (serviceTypeId === "1") {
          navigate(`/comisa-print/${item.id}`);
        } else if (serviceTypeId === "2") {
          navigate(`/free-trade-print/${item.id}`);
        } else {
          console.log(
            getTranslation(
              "staffPages.debug.printCertificate",
              "Opening print certificate in new tab"
            )
          );
          window.open(`/print/certificate/${item.id}`, "_blank");
        }
      },
      condition: (item) =>
        (currentUser?.role === UserRole.Staff ||
          currentUser?.role === UserRole.BranchAdmin) &&
        item.status === RequestStatus.PAID,
      className:
        "flex items-center text-blue-600 hover:text-blue-900 font-medium",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
      ),
    },
  ];

  const [html, setHtml] = useState("");

  // const print = useCallback(() => {
  //   const loadHtml = async () => {
  //     try {
  //       const response = await fetch("public/Target-free-trade-final-1.html"); // relative to public/
  //       const text = await response.text();
  //       setHtml(text);
  //     } catch (error) {
  //       console.error("Error fetching HTML file:", error);
  //     }
  //   };

  //   loadHtml();
  // }, []);

  // const creatReactPortal = useCallback(
  //   (template: string) =>
  //     ReactDOM.createPortal(
  //       <div
  //         dangerouslySetInnerHTML={{
  //           __html: template,
  //         }}
  //       />,
  //       document.getElementById('printModel') || document.body,
  //     ),
  //   [],
  // );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* {creatReactPortal(html)} */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          {getTranslation("staffPages.forms.title", "Documents For Review")}
        </h1>
        <div className="w-16"></div>
      </div>

      <Card>
        <div className="p-4 flex justify-between items-center">
          <div className="flex justify-between items-center space-x-4 w-full">
            {/* Filters section */}

            <div className="flex items-center space-x-4 gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getTranslation(
                    "staffPages.filter.statusLabel",
                    "Request Status"
                  )}
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 max-w-[160px]"
                >
                  {filterOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Show branch filter only for admin role */}
              {currentUser?.role === UserRole.Admin && (
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {getTranslation("staffPages.filter.branchLabel", "Branch")}
                  </label>
                  <CustomSelect
                    options={branches}
                    value={branchFilter}
                    displayKey="name"
                    valueKey="id"
                    onChange={setBranchFilter}
                    className="min-w-[200px]"
                  />
                </div>
              )}
            </div>

            {/* Button section - Show create button only for branch_admin and staff */}
            {(currentUser?.role === UserRole.BranchAdmin ||
              currentUser?.role === UserRole.Staff) && (
                <button
                  onClick={() => navigate("/staff/client-documents")}
                  className="mx-[2rem] px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  style={{ marginLeft: "0px" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {getTranslation("staffPages.forms.newRequest", "New Request")}
                </button>
              )}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
              <p className="mt-2">
                {getTranslation("staffPages.common.loading", "Loading...")}
              </p>
            </div>
          ) : error ? //   <p>{error}</p> // <div className="text-center py-8 text-red-600">
            //   <button
            //     onClick={fetchRequests}
            //     className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark"
            //   >
            //     {getTranslation("staffPages.common.retry", "Retry")}
            //   </button>
            // </div>
            null : (
              <StandardTable
                data={filteredRequests || []}
                columns={columns}
                actions={actions}
                loading={loading}
                onRowClick={handleRowClick}
                processingItemId={processingRequestId}
                emptyTextTranslationKey="staffPages.table.noRequests"
                emptyText="No document requests found."
                loadingTextTranslationKey="staffPages.common.loading"
                loadingText="Loading..."
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                tableClassName="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
                headerClassName="text-md text-center text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
                rowClassName="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b dark:border-gray-700 text-center"
                // New props for complete control
                showActionsColumn={true}
                actionsColumnHeader="Actions"
                actionsColumnClassName="px-6 py-4 text-center"
                actionsContainerClassName="flex justify-center gap-2"
                actionButtonClassName="inline-flex items-center"
                loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
                emptyStateClassName="text-center py-8 text-gray-500"
                errorStateClassName="text-center py-8 text-red-500"
                tableWrapperClassName="overflow-x-auto"
              />
            )}
        </div>
        <Pagination
          onPageChange={(page, pSize) =>
            setPaging({ pageNumber: page, pageSize: pSize + 1 })
          }
          totalItems={totalRows - 1}
        />
      </Card>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRequest(null);
          setActivities([]);
          setActivitiesError(null);
        }}
        selectedRequest={selectedRequest}
        currentUser={currentUser}
        processingRequestId={processingRequestId}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        activities={activities}
        loadingActivities={loadingActivities}
        activitiesError={activitiesError}
        onFetchActivities={fetchRequestActivities}
      />

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setRejectRequestId(null);
        }}
        title={getTranslation(
          "staffPages.forms.rejectRequest",
          "Reject Request"
        )}
        size="md"
      >
        <div className="p-4">
          <label
            htmlFor="rejectionReason"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {getTranslation(
              "staffPages.forms.rejectionReason",
              "Rejection Reason"
            )}
          </label>
          <textarea
            id="rejectionReason"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={getTranslation(
              "staffPages.forms.rejectionReasonPlaceholder",
              "Enter rejection reason"
            )}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button
            onClick={() => {
              setShowRejectModal(false);
              setRejectionReason("");
              setRejectRequestId(null);
            }}
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            {getTranslation("staffPages.forms.cancel", "Cancel")}
          </button>
          <button
            onClick={submitRejection}
            disabled={!rejectionReason || processingRequestId !== null}
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:opacity-50"
          >
            {processingRequestId === rejectRequestId
              ? getTranslation("staffPages.common.processing", "...")
              : getTranslation("staffPages.forms.reject", "Reject")}
          </button>
        </div>
      </Modal>

      {/* API Response Modal */}
      <Modal
        isOpen={showApiResponse}
        onClose={() => setShowApiResponse(false)}
        title="API Response Data"
        className="max-w-6xl"
      >
        <div className="flex h-96">
          {/* Left side - JSON Viewer */}
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Current Response Object
            </h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-full font-mono text-sm">
              <pre>
                {JSON.stringify(
                  requests?.filter((req) => req.id === selectedRequest?.id),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>

          {/* Right side - Additional Info */}
          <div className="flex-1 pl-4 border-l border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Response Information
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Total Requests
                </h4>
                <p className="text-blue-600 dark:text-blue-300">
                  {requests?.length}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Filtered Requests
                </h4>
                <p className="text-green-600 dark:text-green-300">
                  {filteredRequests?.length}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Available Branches
                </h4>
                <p className="text-purple-600 dark:text-purple-300">
                  {branches?.length}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Current Filter
                </h4>
                <p className="text-orange-600 dark:text-orange-300">{filter}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Loading State
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {loading ? "Loading..." : "Loaded"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffDocumentsPage;
