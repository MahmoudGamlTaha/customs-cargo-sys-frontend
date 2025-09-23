import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import RequestDetailsModal from "../../components/RequestDetailsModal";
import {
  StandardTable,
  TableColumn,
  TableAction,
} from "../../components/StandardTable";
import {
  DocumentRequest,
  RequestStatus,
  UserRole,
  UserActivity,
} from "../../types";
import { useLanguage, TranslationKey } from "../../contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "../../components/icons";
import {
  getAllRequests,
  markAsPaid,
  approveRequest,
  rejectRequest,
  getRequestActivities,
} from "../../services/requestService";
import { getRequestTypes } from "../../services/requestTypeService";
import { formatDate } from "../../utils/dateUtils";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const getStatusClass = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.ISSUED:
      return "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light";
    case RequestStatus.APPROVED:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case RequestStatus.COMPLETED:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case RequestStatus.REJECTED:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case RequestStatus.PAID:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

interface RequestType {
  id: string;
  name: string;
  description?: string;
}

interface AccountantDocumentsPageProps {}

const AccountantDocumentsPage: React.FC<AccountantDocumentsPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [filter, setFilter] = useState<
    RequestStatus | "all" | "for_review" | "pending_payment"
  >("all");
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [requestTypeMap, setRequestTypeMap] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [selectedRequest, setSelectedRequest] =
    useState<DocumentRequest | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();
  const isAuditor = currentUser?.role === UserRole.Auditor;

  const token = getCurrentUser()?.accessToken;

  // Fetch request types to map IDs to names
  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        const response = await getRequestTypes(token);
        if (response.success) {
          const types = response.data.data.request_types || [];
          setRequestTypes(types);

          // Build a mapping from request type ID to name
          const mapping: Record<string, string> = {};
          types.forEach((type: RequestType) => {
            mapping[type.id] = type.name;
          });
          setRequestTypeMap(mapping);
          console.log("Request types mapped:", mapping);
        } else {
          console.error("Failed to fetch request types:", response.message);
        }
      } catch (err) {
        console.error("Error fetching request types:", err);
      }
    };

    fetchRequestTypes();
  }, [token]);

  useEffect(() => {
    // Always run fetchData even if token is null, to show proper error state
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check token in fetchData to show proper error
        if (!token) {
          console.error("No authentication token available");
          toast.custom("Authentication required - Please log in");
          setLoading(false);
          return;
        }

        console.log(
          "Calling getAllRequests with token:",
          token.substring(0, 10) + "..."
        );

        // Try-catch specifically around the API call
        try {
          const response = await getAllRequests();
          console.log("API response received:", response);

          if (response.success && response.data) {
            // Handle both data formats
            const requestData = response.data.requests || [];
            console.log(
              "Setting requests data, count:",
              requestData?.length,
              "first item:",
              requestData[0]
            );

            // Map API response to DocumentRequest type with service type names
            const formattedRequests = requestData?.map((req: any) => {
              const typeId = req.request_type_id;
              const serviceTypeName =
                requestTypeMap[typeId] || req.serviceType || "Unknown";

              return {
                ...req,
                serviceType: serviceTypeName,
                serviceTypeId: typeId, // Keep the original ID for reference
              };
            });

            setRequests(formattedRequests);
            // setError(null); // Clear any previous errors
          } else {
            console.error("API response indicates failure:", response.message);
            throw new Error(response.message || "Failed to load requests");
          }
        } catch (apiError) {
          console.error("API call error:", apiError);
          throw new Error(
            `API error: ${
              apiError instanceof Error ? apiError.message : "Unknown error"
            }`
          );
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        // toast.error(err?.message)
        // setError(
        //   err instanceof Error ? err.message : "Failed to load requests"
        // );
      } finally {
        setLoading(false);
      }
    };

    // Call fetchData immediately
    fetchData();

    // Return cleanup function
    return () => {
      console.log("AccountantDocumentsPage useEffect cleanup");
    };
  }, [token, requestTypeMap]);

  // Handle Mark as Paid action
  const handleMarkAsPaid = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation(); // Prevent row click event
    e.preventDefault();

    if (!token || processingRequestId) return;

    setProcessingRequestId(requestId);
    try {
      const response = await markAsPaid(requestId, token);

      if (response.success) {
        // Update the local state to reflect the change
        setRequests((prev) =>
          prev?.map((req) => {
            if (req.id === requestId) {
              return { ...req, status: RequestStatus.PAID };
            }
            return req;
          })
        );
      }
    } catch (err) {
      console.error("Error marking as paid:", err);
      toast.error("Failed to update payment status");
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle Approve action for auditor role
  const handleApprove = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation(); // Prevent row click event
    e.preventDefault();

    if (!token || processingRequestId) return;

    setProcessingRequestId(requestId);
    try {
      const response = await approveRequest(requestId, token);

      if (response.success) {
        // Update the local state to reflect the change
        setRequests((prev) =>
          prev?.map((req) => {
            if (req.id === requestId) {
              return { ...req, status: RequestStatus.APPROVED };
            }
            return req;
          })
        );
      }
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Failed to approve request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle Reject action - opens modal instead of direct rejection
  const handleReject = (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation(); // Prevent row click event
    e.preventDefault();

    if (!token || processingRequestId) return;

    setRejectRequestId(requestId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Submit rejection with reason
  const submitRejection = async () => {
    if (!token || !rejectRequestId) return;

    setProcessingRequestId(rejectRequestId);

    try {
      const response = await rejectRequest(
        rejectRequestId,
        rejectionReason,
        token
      );

      if (response.success) {
        // Update the local state to reflect the change
        setRequests((prev) =>
          prev?.map((req) => {
            if (req.id === rejectRequestId) {
              return { ...req, status: RequestStatus.REJECTED };
            }
            return req;
          })
        );
        setShowRejectModal(false);
        setRejectionReason("");
        setRejectRequestId(null);
        toast.success("تم رفض الطلب بنجاح");
      } else {
        toast.error(response.message || "فشل في رفض الطلب");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("فشل في رفض الطلب");
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle row click to show details modal
  const handleRowClick = (request: DocumentRequest) => {
    setSelectedRequest(request);
    fetchRequestActivities(request.id);
    setShowDetailsModal(true);
  };

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
        setActivitiesError(response.message || "Failed to fetch activity logs");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivitiesError("An error occurred while fetching activity logs");
    } finally {
      setLoadingActivities(false);
    }
  };

  // Filter requests based on the selected filter
  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    if (filter === "for_review") {
      return req.status === RequestStatus.ISSUED;
    }
    if (filter === "pending_payment") {
      return req.status === RequestStatus.APPROVED;
    }
    if (filter === "PAID") {
      return req.status === RequestStatus.PAID;
    }
    return req.status === filter;
  });

  const filterOptions = [
    { value: "all", label: t("accountantPages.common.all") || "الكل" },
    {
      value: "for_review",
      label: t("accountantPages.filter.forReview") || "للمراجعة",
    },
    {
      value: "pending_payment",
      label: t("accountantPages.filter.pendingPayment") || "في انتظار الدفع",
    },
    { value: RequestStatus.COMPLETED, label: t("status.COMPLETED") || "مكتمل" },
    { value: RequestStatus.REJECTED, label: t("status.REJECTED") || "مرفوض" },
  ];

  // Helper function to get translation with better fallback
  const getTranslation = (key: string, fallback: string): string => {
    const translation = t(key);
    console.log("Translation for", key, "is", translation);
    return translation === key ? fallback : translation;
  };

  // Define table columns configuration
  const columns: TableColumn<DocumentRequest>[] = [
    {
      key: "id",
      header: "رقم الطلب",
      translationKey: "accountantPages.documents.table.requestId",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-brand-primary/5 dark:bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/20 dark:border-brand-primary/30">
          {item.id}
        </div>
      ),
    },
    {
      key: "serialNumber",
      header: "الرقم التسلسلي",
      translationKey: "accountantPages.documents.table.serialNumber",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.serialNumber || item?.details[0]?.serial_number || "-"}
        </div>
      ),
    },
    {
      key: "request_type_name",
      header: "نوع الخدمة",
      translationKey: "accountantPages.documents.table.serviceType",
      render: (item) => (
        <div className="text-center text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
          {item.request_type_name ||
            getTranslation(
              `data.serviceTypes.${item.serviceType}` as TranslationKey,
              item.serviceType
            )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "التاريخ",
      translationKey: "accountantPages.documents.table.date",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {formatDate(item.createdAt)}
        </div>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      translationKey: "accountantPages.documents.table.status",
      render: (item) => (
        <div className="flex justify-center">
          <span
            className={`px-3 py-2 text-sm font-medium rounded-lg ${getStatusClass(
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
      key: "fee",
      header: "المبلغ",
      translationKey: "accountantPages.documents.table.amount",
      render: (item) => (
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center">
          {item.fee ? `${item.fee} د.ت` : "-"}
        </div>
      ),
    },
  ];

  // Define table actions configuration
  const actions: TableAction<DocumentRequest>[] = [
    {
      key: "review",
      label: "مراجعة",
      translationKey: "accountantPages.documents.table.review",
      onClick: (item) => handleRowClick(item),
      className:
        "text-brand-primary font-semibold hover:underline bg-transparent border-none px-0 py-0",
      icon: null,
    },
    // Mark as Paid action (for accountant role)
    {
      key: "markAsPaid",
      label: "تم الدفع",
      translationKey: "accountantPages.actions.markAsPaid",
      onClick: (item, event) => handleMarkAsPaid(event, item.id),
      condition: (item) => !isAuditor && item.status === RequestStatus.APPROVED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "common.processing",
      className:
        "bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-sm border-2 border-green-500 hover:border-green-600",
      icon: (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    // Reject action (for accountant role)
    {
      key: "reject",
      label: "رفض",
      translationKey: "accountantPages.actions.reject",
      onClick: (item, event) => handleReject(event, item.id),
      condition: (item) => !isAuditor && item.status === RequestStatus.APPROVED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "common.processing",
      className:
        "bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm border-2 border-red-500 hover:border-red-600",
      icon: (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    // Approve action (for auditor role)
    {
      key: "approve",
      label: "موافقة",
      translationKey: "accountantPages.actions.approve",
      onClick: (item, event) => handleApprove(event, item.id),
      condition: (item) => isAuditor && item.status === RequestStatus.ISSUED,
      disabled: (item) => processingRequestId === item.id,
      loading: (item) => processingRequestId === item.id,
      loadingTextTranslationKey: "common.processing",
      className:
        "bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 hover:shadow-sm border-2 border-brand-primary hover:border-brand-primary-hover",
      icon: (
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {getTranslation(
            "accountantPages.documents.title",
            "Financial Review"
          )}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon />
          <span className="ltr:ml-2 rtl:mr-2">
            {getTranslation("common.back", "العودة")}
          </span>
        </button>
      </div>

      <Card>
        {currentUser.role !== UserRole.Accountant && (
          <div className="p-4 border-b dark:border-gray-700 flex flex-wrap items-center gap-4">
            <label htmlFor="statusFilter" className="font-semibold">
              {getTranslation(
                "accountantPages.common.filterByStatus",
                "Filter by Status"
              )}
              :
            </label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as
                    | RequestStatus
                    | "all"
                    | "for_review"
                    | "pending_payment"
                )
              }
              className="p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
            >
              {(filterOptions || [])?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <StandardTable
          data={filteredRequests}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={handleRowClick}
          processingItemId={processingRequestId}
          emptyTextTranslationKey="accountantPages.common.noRequests"
          emptyText="لم يتم العثور على طلبات تطابق الفلتر المحدد."
          loadingTextTranslationKey="accountantPages.common.loading"
          loadingText="جاري تحميل البيانات..."
          className=""
          tableClassName="w-full"
          headerClassName="text-md text-center text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
          rowClassName="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          // New props for complete control
          showActionsColumn={true}
          actionsColumnHeader="actions"
          actionsColumnClassName="py-3 px-4"
          actionsContainerClassName="flex flex-row items-center justify-center flex-wrap gap-2"
          actionButtonClassName="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200"
          loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
          emptyStateClassName="text-center py-8 text-gray-500"
          errorStateClassName="text-center py-8 text-red-500"
          tableWrapperClassName="overflow-x-auto"
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
        onApproveRequest={handleApprove}
        onRejectRequest={handleReject}
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
        title="رفض الطلب"
        size="md"
      >
        <div className="p-4">
          <label
            htmlFor="rejectionReason"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            سبب الرفض
          </label>
          <textarea
            id="rejectionReason"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="أدخل سبب الرفض..."
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
            إلغاء
          </button>
          <button
            onClick={submitRejection}
            disabled={!rejectionReason || processingRequestId !== null}
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:opacity-50"
          >
            {processingRequestId === rejectRequestId ? "جاري المعالجة..." : "رفض"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AccountantDocumentsPage;
