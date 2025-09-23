import React, { useEffect, useState } from "react";
import Card from "../components/Card";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
import { MOCK_BI_DATA } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage, TranslationKey } from "../contexts/LanguageContext";
import { branchInquiriesCount } from "../data/dummyInquiries";
import { Wallet } from "../types";
import { Link, useNavigate } from "react-router-dom";
import {
  getMemberCount,
  getRequestsCount,
} from "../services/dashboard/admin/adminDashboardService";
import {
  DocumentIcon,
  ReportsIcon,
  PaymentIcon,
  SettingsIcon,
  SupportIcon,
} from "../components/icons";
import DevelopmentBadge from "../components/DevelopmentBadge";
import { getAdminActivities, Activity } from "../services/activityService";
import { StatCard } from "./AccountantDashboard";

const COLORS = ["var(--brand-primary, #EA580C)", "#007A3D", "#D4AF37", "#DC2626"];

interface BranchAdminDashboardProps {
  memberCount: number;
  requestsCount: number;
  wallets: Wallet[];
}

// Navigation card component for branch admin dashboard
const NavCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  t: (key: string) => string;
  showBadge?: boolean;
}> = ({ title, description, icon, to, color, t, showBadge = false }) => (
  <Link
    to={to}
    className="block h-full transition-transform duration-300 transform hover:scale-105"
  >
    <Card className="h-full">
      <div className="flex flex-col h-full p-5">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-4 rounded-lg ${color} w-16 h-16 flex items-center justify-center`}
          >
            {icon}
          </div>
          {showBadge && <DevelopmentBadge />}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 flex-grow">
          {description}
        </p>
        <div className="mt-4 text-sm font-medium text-brand-primary dark:text-brand-primary-light">
          {t("adminDashboard.navigation.viewDetails")}
        </div>
      </div>
    </Card>
  </Link>
);

const BranchAdminDashboard: React.FC<BranchAdminDashboardProps> = ({
  memberCount,
  requestsCount,
  wallets,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const tickColor = theme === "dark" ? "#A0AEC0" : "#374151";

  console.log("🏢 BranchAdminDashboard - Component initialized with props:");
  console.log("🏢 BranchAdminDashboard - memberCount (prop):", memberCount);
  console.log("🏢 BranchAdminDashboard - requestsCount (prop):", requestsCount);
  console.log("🏢 BranchAdminDashboard - wallets:", wallets);
  const navigate = useNavigate();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for API data
  const [apiMemberCount, setApiMemberCount] = useState<number>(0);
  const [apiRequestsCount, setApiRequestsCount] = useState<number>(0);
  const [loadingApiData, setLoadingApiData] = useState(true);
  const [branchName, setBranchName] = useState<string>("");

  const totalWalletBalance = wallets.reduce(
    (acc, wallet) => acc + wallet.balance,
    0
  );

  // Get branch name from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.branch && user.branch.name) {
          setBranchName(user.branch.name);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getAdminActivities(1, 3);
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching admin activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // New useEffect for API data
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        setLoadingApiData(true);

        // Fetch both API endpoints in parallel
        const [memberResponse, requestsResponse] = await Promise.all([
          getMemberCount(),
          getRequestsCount(),
        ]);

        setApiMemberCount(memberResponse.data.member_count);
        setApiRequestsCount(requestsResponse.data.total);
      } catch (error) {
        // Set default value on error
        setApiMemberCount(0);
        setApiRequestsCount(0);
      } finally {
        setLoadingApiData(false);
      }
    };

    fetchApiData();
  }, []);

  const translatedMemberGrowth = MOCK_BI_DATA.memberGrowth?.map((item) => ({
    ...item,
    name: t(`data.months.${item.name}` as TranslationKey),
  }));

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        {branchName
          ? `${t("branchAdminDashboard.branchTitle")} ${branchName}`
          : t("branchAdminDashboard.title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <Card cardTitle={t("branchAdminDashboard.cards.totalUsers")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              {apiMemberCount.toLocaleString() - 2}
            </p>
          )}
        </Card>
        <Link to="/branch/inquiries">
          <Card cardTitle={t("branchAdminDashboard.cards.inquiryLog")} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
                {branchInquiriesCount}
              </p>
              <span className="text-sm text-gray-500">
                {t("branchAdminDashboard.cards.totalInquiries")}
              </span>
            </div>
            <div className="mt-2 text-sm font-medium text-brand-primary dark:text-brand-primary-light">
              {t("adminDashboard.navigation.viewDetails")}
            </div>
          </Card>
        </Link>
      </div>

      {/* Other cards hidden as requested */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card cardTitle={t("branchAdminDashboard.cards.totalUsers")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              {apiMemberCount.toLocaleString()}
            </p>
          )}
        </Card>
        <Card cardTitle={t("branchAdminDashboard.cards.totalMembers")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              ...
            </p>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-3xl md:text-4xl font-bold text-brand-primary">
                {apiMemberCount.toLocaleString()}
              </p>
              <span>
                {" "}
                <DevelopmentBadge />
              </span>
            </div>
          )}
        </Card>
        <Card cardTitle={t("adminDashboard.cards.totalRequests")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              {apiRequestsCount.toLocaleString()}
            </p>
          )}

          <div className="mt-2 text-left">
            <button
              onClick={() => navigate("/accountant/documents")}
              className="text-sm text-black hover:underline"
            >
              مراجعة ودفع
            </button>
          </div>
        </Card>
        <Card cardTitle={t("adminDashboard.cards.totalWalletFunds")}>
          <p className="text-3xl md:text-4xl font-bold text-brand-accent flex justify-between items-center">
            <div>
              {totalWalletBalance.toLocaleString("en-US")}{" "}
              <span className="text-sm">{t("adminDashboard.cards.lyd")}</span>
            </div>

            <span>
              {" "}
              <DevelopmentBadge />
            </span>
          </p>
        </Card>
        <Card cardTitle={t("adminDashboard.cards.activeDisputes")}>
          <div className="flex justify-between items-center">
            <p className="text-3xl md:text-4xl font-bold text-red-600">15</p>
            <DevelopmentBadge />
          </div>
        </Card>
      </div> */}

      {/* Administration section hidden as requested */}
      {/* <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {t("adminDashboard.sections.administration")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <NavCard
          title={t("adminPages.cards.documents")}
          description={t("adminPages.cards.documentsDescription")}
          icon={<DocumentIcon className="w-8 h-8 text-white" />}
          to="/staff/documents"
          color="bg-green-600"
          t={t}
        />

        <NavCard
          title={t("adminDashboard.navigation.financials")}
          description={t("adminDashboard.navigation.financialsDescription")}
          icon={<PaymentIcon />}
          to="/admin/finances"
          color="bg-purple-600"
          t={t}
          showBadge={true}
        />
      </div> */}

      {/* Insights and Controls section hidden as requested */}
      {/* <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {t("adminDashboard.sections.insightsAndControls")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NavCard
          title={t("adminDashboard.navigation.reportsAnalytics")}
          description={t(
            "adminDashboard.navigation.reportsAnalyticsDescription"
          )}
          icon={<ReportsIcon className="w-8 h-8 text-white" />}
          to="/bi-reports"
          color="bg-indigo-600"
          t={t}
          showBadge={true}
        />

        <NavCard
          title={t("adminDashboard.navigation.notifications")}
          description={t("adminDashboard.navigation.notificationsDescription")}
          icon={<SupportIcon />}
          to="/notifications"
          color="bg-red-600"
          t={t}
          showBadge={true}
        />

        <NavCard
          title={t("adminDashboard.navigation.systemSettings")}
          description={t("adminDashboard.navigation.systemSettingsDescription")}
          icon={<SettingsIcon />}
          to="/admin/settings"
          color="bg-gray-600"
          t={t}
        />
      </div> */}

      <Card
        cardTitle={t("adminDashboard.recentActivity.title")}
        className="mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 dark:border-gray-700">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
                <th className="py-3 px-4 text-center">المستخدم</th>
                <th className="py-3 px-4 text-center">الوصف</th>
                <th className="py-3 px-4 text-center">الوحدة</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : (activities || [])?.length > 0 ? (
                (activities || [])
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
                          className={`inline-block px-2 py-1 rounded-md text-sm text-center w-16 ${
                            activity.action === "create"
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
  );
};

export default BranchAdminDashboard;
