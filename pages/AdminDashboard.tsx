import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MOCK_BI_DATA } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage, TranslationKey } from "../contexts/LanguageContext";
import { totalInquiriesCount } from "../data/dummyInquiries";
import { Wallet } from "../types";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  DocumentIcon,
  ReportsIcon,
  PaymentIcon,
  SettingsIcon,
  BuildingOfficeIcon,
  SupportIcon,
} from "../components/icons";
import DevelopmentBadge from "../components/DevelopmentBadge";
import { getAdminActivities, Activity } from "../services/activityService";
import {
  getRatioSum,
  getMemberCount,
  getRequestsCount,
} from "../services/dashboard/admin/adminDashboardService";
import { dataProcessor } from "@/utils/DataProcessor";
import Modal from "@/components/Modal";
import StandardTable, { TableColumn } from "@/components/StandardTable";
import { GetBranchedRatioDetails } from "@/services/userService";

const COLORS = ["var(--brand-primary, #EA580C)", "#007A3D", "#D4AF37", "#DC2626"];

interface AdminDashboardProps {
  memberCount: number;
  requestsCount: number;
  wallets: Wallet[];
}

interface IbranchList {
  branch_name: string;
  ratio_sum: number;
}

// Navigation card component for admin dashboard
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  memberCount,
  requestsCount,
  wallets,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const tickColor = theme === "dark" ? "#A0AEC0" : "#374151";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for API data
  const [ratioSum, setRatioSum] = useState<number>(0);
  const [apiMemberCount, setApiMemberCount] = useState<number>(0);
  const [filteredUsersCount, setFilteredUsersCount] = useState<number>(0);
  const [apiRequestsCount, setApiRequestsCount] = useState<number>(0);
  const [loadingApiData, setLoadingApiData] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [branchAmounts, setBranchesAmount] = useState<IbranchList[]>([]);

  // const totalWalletBalance = wallets.reduce(
  //   (acc, wallet) => acc + wallet.balance,
  //   0
  // );

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

        // Fetch all API endpoints in parallel
        const [ratioResponse, memberResponse, requestsResponse, branchesInfoResponse, filteredCount] =
          await Promise.all([
            getRatioSum(),
            getMemberCount(),
            getRequestsCount(),
            GetBranchedRatioDetails(),
            dataProcessor.getFilteredUsersCount(),
          ]);

        setRatioSum(ratioResponse.data.ratio_sum);
        setApiMemberCount(memberResponse.data.member_count);
        setFilteredUsersCount(filteredCount);
        setApiRequestsCount(requestsResponse.data.total);
        setBranchesAmount(branchesInfoResponse?.data?.data)
      } catch (error) {
        // Set default values on error
        setRatioSum(0);
        setApiMemberCount(0);
        setFilteredUsersCount(0);
        setApiRequestsCount(0);
        setBranchesAmount([]);
      } finally {
        setLoadingApiData(false);
      }
    };

    fetchApiData();
  }, []);

  const cols: TableColumn<IbranchList>[] = [
    {
      header: t('adminDashboard.cards.branchName'),
      key: 'branch_name',
    },
    {
      header: t('adminDashboard.cards.ratioSum'),
      key: 'ratio_sum',
      render: (item) => (<p>
        {(item?.ratio_sum || 0).toFixed(2)}
        <span className="mr-2 text-xs">{t("adminDashboard.cards.lyd")}</span>
      </p>)
    }
  ]

  return (
    <div className="relative">
      {/* Watermark */}
      {/* <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-5">
        <img
          src="/gray_customs_long_600x134.png"
          alt="Watermark"
          className="w-auto h-48"
          style={{ maxWidth: '800px', maxHeight: '200px' }}
        />
      </div> */}
      
      {/* Main content with higher z-index */}
      <div className="relative z-10">
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t('adminDashboard.cards.modalBranchTitle')}
        children={
          <StandardTable data={branchAmounts} columns={cols} rowClassName={'text-center'} />
        }
      />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        {t("adminDashboard.title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
        <Card cardTitle={t("adminDashboard.cards.totalUsers")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              {filteredUsersCount.toLocaleString()}
            </p>
          )}
        </Card>
        <Link to="/admin/inquiries">
          <Card cardTitle={t("adminDashboard.cards.inquiryLog")} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
                {totalInquiriesCount}
              </p>
              <span className="text-sm text-gray-500">
                {t("adminDashboard.cards.totalInquiries")}
              </span>
            </div>
            <div className="mt-2 text-sm font-medium text-brand-primary dark:text-brand-primary-light">
              {t("adminDashboard.navigation.viewDetails")}
            </div>
          </Card>
        </Link>
        {/* <Card cardTitle={t("adminDashboard.cards.totalMembers")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-primary">
              ...
            </p>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-3xl md:text-4xl font-bold text-brand-primary">
                {/* {apiMemberCount.toLocaleString()} */}
              {/* </p>
              <span>
                {" "}
                <DevelopmentBadge />
              </span>
            </div>
          )}
        </Card> */}
        {/* <Card cardTitle={t("adminDashboard.cards.totalRequests")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              {apiRequestsCount.toLocaleString()}
            </p>
          )}
        </Card> */}
        {/* <Card
          isClicked
          onClick={() => setOpen(true)}
          cardTitle={t("adminDashboard.cards.totalWalletFunds")}>
          {loadingApiData ? (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              ...
            </p>
          ) : (
            <p className="text-3xl md:text-4xl font-bold text-brand-secondary">
              {ratioSum.toLocaleString()}
              <span className="text-sm">{t("adminDashboard.cards.lyd")}</span>
            </p>
          )}
        </Card> */}
        {/* <Card cardTitle={t("adminDashboard.cards.activeDisputes")}>
          <div className="flex justify-between items-center">
            <p className="text-3xl md:text-4xl font-bold text-red-600">15</p>
            <DevelopmentBadge />
          </div>
        </Card> */}
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {t("adminDashboard.sections.administration")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <NavCard
          title={t("adminPages.cards.usersManagement")}
          description={t("adminPages.cards.usersManagementDescription")}
          icon={<UsersIcon className="w-8 h-8 text-white" />}
          to="/admin/users"
          color="bg-brand-primary"
          t={t}
        />

        <NavCard
          title={t("adminPages.cards.documents")}
          description={t("adminPages.cards.documentsDescription")}
          icon={<DocumentIcon className="w-8 h-8 text-white" />}
          to="/staff/documents"
          color="bg-green-600"
          t={t}
        />

        <NavCard
          title={t("adminPages.cards.branches")}
          description={t("adminPages.cards.branchesDescription")}
          icon={<BuildingOfficeIcon />}
          to="/admin/branches"
          color="bg-yellow-600"
          t={t}
        />

        {/* <NavCard
          title={t("adminPages.cards.certificateTypes")}
          description={t("adminPages.cards.certificateTypesDescription")}
          icon={<DocumentIcon className="w-8 h-8 text-white" />}
          to="/admin/certificate-types"
          color="bg-blue-600"
          t={t}
        /> */}

        {/* <NavCard
          title={t("adminDashboard.navigation.financials")}
          description={t("adminDashboard.navigation.financialsDescription")}
          icon={<PaymentIcon />}
          to="/admin/finances"
          color="bg-purple-600"
          t={t}
          showBadge={true}
        /> */}
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
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
      </div>

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
              ) : activities?.length > 0 ? (
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
                          className={`inline-block px-2 py-1 rounded-md text-sm text-center w-16 ${activity.action === "create"
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

export default AdminDashboard;
