import React, { useState,useCallback, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";
import StandardTable, { TableColumn } from "../../components/StandardTable";
import Card from "../../components/Card";
import CustomSelect from "../../components/CustomSelect";
import { dummyInquiries, Inquiry } from "../../data/dummyInquiries";
import { Activity, getAdminActivities } from "@/services/activityService";
import Button from "@/components/Button";
import { LinkIcon } from "@heroicons/react/16/solid";
import { searchCertificateBySerial } from "@/services/public/publicCertificateService";
import toast from "react-hot-toast";

const BranchInquiriesPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  useEffect(() => {
    // Simulate API call
    const fetchInquiries = async () => {
      setLoading(true);
      // Simulate delay
      const result = await getAdminActivities()
      if (result.data) {
        console.log(result.data, "Dataaaa aC");
        setInquiries(result.data);
      }
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // setInquiries(dummyInquiries);
      setLoading(false);
    };

    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter((inquiry) => {
    // For branch_admin: show only data from their branch (Tripoli)
    // For admin: show all data with filter option
    const branchMatch = filterBranch === "all" || inquiry.entity_name === filterBranch

    // Search by employee name or ID
    const searchMatch =
      searchTerm === "" ||
      inquiry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    return branchMatch && searchMatch;
  });

  
  const moveToCertificateLink = useCallback(async(sn: string) => {
    const result = await searchCertificateBySerial(sn)
    const fixedUrl = `${(import.meta as any).env.VITE_API_CHAMBERS}`;
    if(result){
      window.open(
        `${fixedUrl}public/certificate/comisa/${result.qr_identifier}`,
        "_blank"
      );
    }else{
      toast.error('problem in this certificate: FE')
    }
  }, [searchCertificateBySerial])

  const getCertificateDetails = (sn: string) => {
    if (!sn) {
      return "-";
    }
    return (
      <div className="text-sm">
        <Button variant="outlined" size="sm" icon={<LinkIcon className='size-4'/>} onClick={() => moveToCertificateLink(sn)}>
          {t("inquiries.viewCertificate")}
        </Button>
        {/* <a
          href={`${window.location.origin}/#/public/certificate/free-trade/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:text-orange-700 transition-colors dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30"
        >
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a> */}
      </div>
    );
  };

  const columns: TableColumn<Activity>[] = [
    {
      key: "id",
      header: t("inquiries.table.numbering"),
      render: (_, index) => index + 1,
      className: "text-center font-medium text-gray-500",
    },
    {
      key: "employeeId",
      header: t("inquiries.table.employeeId"),
      render: (inquiry) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {inquiry.user_id}
        </span>
      ),
      className: "text-center",
    },
    // {
    //   key: "employeeName",
    //   header: t("inquiries.table.employeeName"),
    //   render: (inquiry) => (
    //     <span className="font-medium text-gray-900 dark:text-gray-100">
    //       {inquiry.}
    //     </span>
    //   ),
    //   className: "text-center",
    // },
    {
      key: "branch",
      header: t("inquiries.table.branch"),
      render: (inquiry) => (
        <span className="text-gray-700 dark:text-gray-300">
          {inquiry.entity_name}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "description",
      header: t("inquiries.table.question"),
      render: (inquiry) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
            {inquiry.description}
          </p>
        </div>
      ),
      className: "text-center",
    },
    // {
    //   key: "status",
    //   header: t("inquiries.table.status"),
    //   render: (inquiry) => getStatusBadge(inquiry.status),
    //   className: "text-center",
    // },
    {
      key: "certificateDetails",
      header: t("inquiries.table.certificateDetails"),
      render: (inquiry) => getCertificateDetails(inquiry?.serial_number),
      className: "text-center",
    },
  ];

  const branchOptions = [
    { value: "all", label: t("inquiries.filter.allBranches") },
    ...Array.from(new Set(inquiries.map((inquiry) => inquiry?.entity_name))).map(
      (branch) => ({
        value: branch,
        label: branch,
      })
    ),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {t("inquiries.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("inquiries.subtitle")}
        </p>
        {user?.role === UserRole.BranchAdmin && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {t("inquiries.branchAdminNote")}
          </p>
        )}
      </div>

      <Card className="mb-6">
        <div className="p-6 py-0">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search field - available for all users */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("inquiries.search.label")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("inquiries.search.placeholder")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Branch filter - only for admin */}
            {user?.role === UserRole.Admin && (
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("inquiries.filter.branch")}
                </label>
                <CustomSelect
                  options={branchOptions}
                  value={filterBranch}
                  onChange={(value) => setFilterBranch(value)}
                  placeholder={t("inquiries.filter.selectBranch")}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <StandardTable
            data={filteredInquiries}
            columns={columns}
            loading={loading}
            className="min-w-full"
          />
        </div>
      </Card>
    </div>
  );
};

export default BranchInquiriesPage;