import React, { useState, useEffect } from "react";
import BranchModal from "../../components/BranchModal";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getBranches,
  createBranch,
  Branch,
} from "../../services/branchService";
import { useAuth } from "../../contexts/AuthContext";
import { StandardTable, TableColumn } from "../../components/StandardTable";
import toast from "react-hot-toast";

const AdminBranchPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<
    Omit<Branch, "id"> | Branch | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBranches = async () => {
    if (!token) {
      let xtoken = localStorage.getItem("token");
      if (xtoken) {
        console.log(xtoken);
      }
    }
    setIsLoading(true);
    try {
      const result = await getBranches(token);
      if (result.success && result.data) {
        const branchesData = result.data.data?.branches ?? result.data.data;
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } else {
        toast.error(result.message || t("sidebar.branches.fetchError"));
      }
    } catch (err: any) {
      toast.error(err.message || t("sidebar.branches.fetchErrorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [token]);

  const handleAddBranch = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (branchData: Omit<Branch, "id"> | Branch) => {
    // console.log(branchData, "CVVV")
    // if (!token) return;
    setIsProcessing(true);
    try {
      const result = await createBranch(
        branchData as Omit<Branch, "id">,
        token
      );
      if (result.success) {
        toast.success(t("sidebar.branches.saveSuccess"));
        fetchBranches();
        setIsModalOpen(false);
      } else {
        toast.error(result.message || t("sidebar.branches.saveError"));
      }
    } catch (err: any) {
      toast.error(err.message || t("sidebar.branches.saveErrorGeneric"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Define table columns configuration
  const columns: TableColumn<Branch>[] = [
    {
      key: 'name',
      header: 'Name',
      translationKey: 'sidebar.branches.name',
      render: (item) => (
        <div className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex items-center justify-center">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
              {item.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      translationKey: 'sidebar.branches.code',
      render: (item) => (
        // <div className="px-6 py-4 whitespace-nowrap text-center">
        //   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-center">
        //     {item.code}
        //   </span>
        // </div>
         <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {item.code}
       </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      translationKey: 'sidebar.branches.address',
      render: (item) => (
        <div className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs text-center">
            {item.address || t("sidebar.branches.notSpecified")}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      translationKey: 'sidebar.branches.phone',
      render: (item) => (
        <div className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-gray-100 text-center">
            {item.phone || t("sidebar.branches.notSpecified")}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      translationKey: 'sidebar.branches.email',
      render: (item) => (
        <div className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate text-center">
            {item.email || t("sidebar.branches.notSpecified")}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="container mx-auto p-4"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t("sidebar.branches.title")}
        </h1>
        <button
          onClick={handleAddBranch}
          disabled={isLoading}
          className="bg-brand-primary hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? t("sidebar.branches.loading") : t("sidebar.branches.addBranch")}
        </button>
      </div>

      {isLoading && <p>{t("sidebar.branches.loading")}</p>}
      {/* {error && <p className="text-red-500">{error}</p>} */}

      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <StandardTable
            data={branches}
            columns={columns}
            loading={isLoading}
            emptyTextTranslationKey="sidebar.branches.noBranchesAvailable"
            emptyText="No branches available. Click 'Add Branch' to create your first branch."
            loadingTextTranslationKey="sidebar.branches.loading"
            loadingText="Loading branches..."
            className="overflow-x-auto"
            tableClassName="w-full text-sm"
            headerClassName="text-md text-center text-gray-700 uppercase bg-gray-200 dark:bg-gray-600 dark:text-gray-300 py-3 px-4"
            rowClassName={(item, index) => `hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
              index % 2 === 0
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-50 dark:bg-gray-800/50"
            }`
            }
            // No actions column for branches
            showActionsColumn={false}
            tableWrapperClassName="overflow-x-auto"
          />
        </div>
      )}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBranch}
        branch={selectedBranch}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default AdminBranchPage;
