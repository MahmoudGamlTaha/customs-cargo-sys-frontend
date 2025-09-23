import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import StandardTable, { TableColumn } from "../../components/StandardTable";
import { getRequestTypes } from "../../services/requestTypeService";
import Card from "../../components/Card";

interface RequestType {
  id: number;
  name: string;
  name_en: string | null;
  price: number;
  ratio: number;
}

interface RequestTypesResponse {
  success: boolean;
  message: string;
  data: {
    pagination: {
      page: number;
      page_size: number;
      total: number;
      total_pages: number;
    };
    request_types: RequestType[];
  };
  timestamp: string;
}

const CertificateTypesPage: React.FC = () => {
  const { t } = useLanguage();
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        setLoading(true);
        const response = await getRequestTypes();
        
        if (response.success && response.data) {
          // Check if request_types exists and is an array
          if (response?.data?.data?.request_types && Array.isArray(response.data.data.request_types)) {
            setRequestTypes(response?.data?.data?.request_types);
          } else {
            setRequestTypes([]);
          }
        } else {
          setRequestTypes([]);
        }
      } catch (err) {
        setRequestTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestTypes();
  }, []);
  

  const columns: TableColumn<RequestType>[] = [
    {
      key: "name",
      header: "اسم الشهادة",
      translationKey: "adminPages.certificateTypes.name",
    },
    {
      key: "price",
      header: "السعر",
      translationKey: "adminPages.certificateTypes.price",
      render: (item) => (
        <span className="font-medium">
          {item.price.toLocaleString()} 
          <span className="mr-1 text-sm text-gray-500">{t("adminPages.certificateTypes.currency")}</span>
        </span>
      ),
    },
    {
      key: "ratio",
      header: "النسبة",
      translationKey: "adminPages.certificateTypes.ratio",
      render: (item) => (
        <span className="font-medium">
          {(item.ratio * 100).toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          {t("adminPages.certificateTypes.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("adminPages.certificateTypes.description")}
        </p>
      </div>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
            </div>
          ) : requestTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("adminPages.certificateTypes.emptyTitle")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("adminPages.certificateTypes.emptyDescription")}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {t("common.refresh")}
              </button>
            </div>
          ) : (
            <StandardTable
              data={requestTypes}
              columns={columns}
              loading={loading}
              showRowNumbers={true}
              rowNumberHeader="№"
              rowNumberHeaderTranslationKey="common.rowNumber"
              emptyText={t("adminPages.certificateTypes.noData")}
              emptyTextTranslationKey="adminPages.certificateTypes.noData"
              className="w-full"
              tableClassName="w-full"
              rowClassName="text-center"
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CertificateTypesPage;
