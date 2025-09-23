import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useLanguage } from "../contexts/LanguageContext";
import {
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
} from "../components/icons";
import { Link } from "react-router-dom";
import { getRequestCount, RequestCountResponse, RequestCountData } from "../services/requestCountService";
import { Activity, getAdminActivities } from "@/services/activityService";
import { getFullBranchTitle } from "../utils/getBranchName";

// StatCard component similar to StaffDashboard
export const StatCard: React.FC<{
  title: string,
  count: number,
  linkTo: string,
  icon: React.ReactNode,
  cta: string,
  isLoading?: boolean,
  showAnimation?: boolean
}> = ({ title, count, linkTo, icon, cta, isLoading = false, showAnimation = false }) => (
  <Link to={linkTo} className="block h-full">
    <Card className="h-full">
      <div className="flex flex-col items-center justify-center text-center h-full p-4">
        <div className="p-3 sm:p-4 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary-light rounded-full mb-4">
          {icon}
        </div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
        {isLoading ? (
          <div className="flex items-center justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className={`text-3xl sm:text-4xl font-bold text-brand-primary dark:text-brand-primary-light my-4 ${showAnimation ? 'animate-pulse' : ''}`}>
            {count.toLocaleString()}
          </div>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">{cta}</p>
      </div>
    </Card>
  </Link>
);

const AccountantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [requestCount, setRequestCount] = useState<RequestCountData>({
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCountAnimation, setShowCountAnimation] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch request count from API
  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        setIsLoading(true);
        const response = await getRequestCount();
        if (response.success) {
          setRequestCount(response.data);
          setShowCountAnimation(true);
          // Reset animation after a short delay
          setTimeout(() => setShowCountAnimation(false), 1000);
        } else {
          console.error('API returned error:', response.message);
        }
      } catch (error) {
        console.error('Error fetching request count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestCount();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // setLoading(true);
        const response = await getAdminActivities(1, 3);
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching admin activities:", error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">
        {getFullBranchTitle('accountant')}
      </h2>
      <p className="mb-6 text-base sm:text-lg text-gray-600 dark:text-gray-400">
        {t("accountantPages.dashboard.subtitle") || "إدارة ومراجعة جميع طلبات المستندات"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t("accountantPages.dashboard.inquiries") || "الاستعلامات"}
          count={requestCount.total || 0}
          linkTo="/staff/documents"
          icon={<DocumentIcon />}
          cta={t("accountantPages.dashboard.viewInquiries") || "عرض الاستعلامات"}
          isLoading={isLoading}
          showAnimation={showCountAnimation}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          cardTitle={
            t("accountantPages.dashboard.quickActions.title") || "إجراءات سريعة"
          }
        >
          <div className="p-4 space-y-3">
            <button
              onClick={() => navigate("/accountant/documents")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-brand-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {t("accountantPages.dashboard.viewAllRequestsAction") ||
                "View All Document Requests"}
            </button>

            <button
              onClick={() =>
                navigate("/accountant/documents?filter=pending_payment")
              }
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-brand-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("accountantPages.dashboard.pendingPaymentsAction") ||
                "Review Payment Requests"}
            </button>
          </div>
        </Card>

        <Card
          cardTitle={
            t("accountantPages.dashboard.recentActivity.title") ||
            "النشاط الأخير"
          }
        >
          <div className="p-4 min-w-auto overflow-x-auto">
            <table className="w-full">
              <thead className="text-sm">
                <tr className="border-b-2 dark:border-gray-700">
                  <th className="py-3 px-4 text-center">#</th>
                  <th className="py-3 px-4 text-center">الإجراء</th>
                  <th className="py-3 px-4 text-center">المستخدم</th>
                  <th className="py-3 px-4 text-center">الوصف</th>
                  <th className="py-3 px-4 text-center">الوحدة</th>
                </tr>
              </thead>
              <tbody className="text-center text-xs">
                {activities?.length > 0 ? (
                  activities
                    ?.sort((a, b) => b.id - a.id) // ترتيب من الأحدث إلى الأقدم حسب ID
                    ?.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 w-24">
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs text-center w-16 ${activity.action === "create"
                                ? "bg-green-100 text-green-800"
                                : activity.action === "reject"
                                  ? "bg-red-100 text-red-800"
                                  : activity.action === "get"
                                    ? "bg-brand-primary/10 text-brand-primary"
                                    : activity.action === "approve"
                                      ? "bg-purple-100 text-purple-800"
                                      : activity.action === "mark_paid"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {activity.action === "create"
                              ? "إنشاء"
                              : activity.action === "reject"
                                ? "رفض"
                                : activity.action === "get"
                                  ? "استعلام"
                                  : activity.action === "approve"
                                    ? "موافقة"
                                    : activity.action === "mark_paid"
                                      ? "دفع"
                                      : activity.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {activity.username || `User ${activity.user_id}`}
                        </td>
                        <td className="py-3 px-4">{activity.description}</td>
                        <td className="py-3 px-4 text-gray-500">
                          #{activity.entity_id}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-gray-500">
                      لا توجد أنشطة حديثة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountantDashboard;
