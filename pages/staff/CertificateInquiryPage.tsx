import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OfficialLogoIcon } from "../../components/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  searchCertificateBySerial,
  CertificateValidationData,
} from "../../services/public/publicCertificateService";
import Card from "../../components/Card";
import { GetMembershipByIdPublic } from "@/services/requestService";

const CertificateInquiryPage: React.FC = () => {
  const [isMembershipInquery, setIsMembershipInquery] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [certificateNumber, setCertificateNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    found: boolean;
    certificateNumber: string;
    message: string;
    certificateData?: CertificateValidationData;
  } | null>(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "ar", name: "العربية", flag: "AR" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto scroll to results when they appear
  useEffect(() => {
    if (result) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [result]);

  const handleSearch = async () => {
    if (!certificateNumber.trim()) {
      alert(t("certificateValidation.enterCertificateNumber"));
      return;
    }

    setLoading(true);
    setResult(null);
    if (isMembershipInquery) {
      const result = await GetMembershipByIdPublic(certificateNumber.trim());
      if (result.success) {
        console.log(result?.data, "DDD")
        setLoading(false);
        setResult({
          found: true,
          certificateNumber: certificateNumber.trim(),
          message: t("certificateInquiry.memberShipfound"),
          certificateData: result.data?.data,
        });
      } else {
        setLoading(false);
        setResult({
          found: false,
          certificateNumber: certificateNumber.trim(),
          message: t("certificateValidation.memberShipNotFound"),
        });
      }
    } else {
    try {
      const certificateData = await searchCertificateBySerial(
        certificateNumber.trim()
      );

      setResult({
        found: true,
        certificateNumber: certificateNumber.trim(),
        message: t("certificateValidation.foundSuccess"),
        certificateData: certificateData,
      });
    } catch (error) {
      console.error("Error validating certificate:", error);
      setResult({
        found: false,
        certificateNumber: certificateNumber.trim(),
        message: t("certificateValidation.notFound"),
      });
    } finally {
      setLoading(false);
    }
    }
  };

  const handleViewCertificate = () => {
    console.log(result?.certificateData?.qr_identifier, "QR")
    // if (!result?.certificateData?.qr_identifier) {
    //   alert(t("certificateValidation.featureNotImplemented"));
    //   return;
    // }

    const fixedUrl = `${(import.meta as any).env.VITE_API_CHAMBERS}`;
    // Determine the certificate type based on request_type_id
    const requestTypeId = result.certificateData.request_type_id;
    if (isMembershipInquery) {
      // http://51.20.121.17/#/public/certificate/membership/131
      window.open(
        `${fixedUrl}#/public/certificate/membership/${result.certificateData.id}`,
        "_blank"
      );
    } else {

      if (requestTypeId === 1) {
      // COMESA Certificate

        window.open(
          `${fixedUrl}#/public/certificate/comisa/${result.certificateData.qr_identifier}`,
          "_blank"
        );
      } else if (requestTypeId === 2) {
        // Free Trade Certificate
        window.open(
          `${fixedUrl}#/public/certificate/free-trade/${result.certificateData.qr_identifier}`,
          "_blank"
        );
      }
      else if (requestTypeId === 6) {
        // Free Trade Certificate
        window.open(
          `${fixedUrl}#/public/certificate/origin/${result.certificateData.id}`,
          "_blank"
        );
      }
      else if (requestTypeId === 7) {
        // Free Trade Certificate
        window.open(
          `${fixedUrl}#/public/certificate/free-trade-copy/${result.certificateData.qr_identifier}`,
          "_blank"
        );
      }
      else {
        // Unknown type - show error
        alert(t("certificateValidation.featureNotImplemented"));
      }
    };
  }

  const handleTryAgain = () => {
    setResult(null);
    setCertificateNumber("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <OfficialLogoIcon
            className="h-16 sm:h-20 mx-auto dark:invert mb-6"
            style={{
              width: "120px",
              height: "120px",
            }}
          />

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {isMembershipInquery
              ? t("certificateInquiry.membershipTitle")
              : t("certificateInquiry.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {isMembershipInquery
              ? t("certificateInquiry.membershipSubtitle")
              : t("certificateInquiry.subtitle")}
          </p>
        </div>
        {/* <div className="text-center mb-8">
          <OfficialLogoIcon
            clsName="h-16 sm:h-20 mx-auto dark:invert mb-6"
            style={{
              wih: "120px",
              heht: "120px",
            }}
          /> */}
        <div className="flex gap-4 justify-center my-5">
          <button
            onClick={() => {
              setIsMembershipInquery(false);
            }}
            className={`${!isMembershipInquery
              ? "px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              : "px-6 py-3 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-300 transition-colors"
              } `}
          >
            {t("certificateInquiry.docInqueryBtn")}
          </button>
          <button
            onClick={() => {
              setIsMembershipInquery(true);
            }}
            className={`${isMembershipInquery
              ? "px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              : "px-6 py-3 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-300 transition-colors"
              } `}
          >
            {t("certificateInquiry.membershipInqueyBtn")}
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-8">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-2xl">{currentLanguage?.flag}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentLanguage?.name}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isLanguageDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as "ar" | "en" | "fr");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                      language === lang.code
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isMembershipInquery
                    ? t("certificateInquiry.membershipSearchLabel")
                    : t("certificateInquiry.searchLabel")}
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder={
                      isMembershipInquery
                        ? t("certificateInquiry.membershipSearchPlaceholder")
                        : t("certificateInquiry.searchPlaceholder")
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading
                      ? t("certificateInquiry.searching")
                      : t("certificateInquiry.search")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className="mb-8">
            <div className="p-6">
              <div className="max-w-2xl mx-auto text-center">
                {result.found ? (
                  <div>
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600 dark:text-green-400"
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
                      </div>
                      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {isMembershipInquery
                          ? t("certificateInquiry.memberShipfound")
                          : t("certificateInquiry.found")}
                      </h3>
                      <p className="certificate-number text-gray-600 dark:text-gray-400 ">
                        {isMembershipInquery
                          ? t("certificateInquiry.membershipCertificateNumber")
                          : t("certificateInquiry.certificateNumber")}
                        :{" "}
                        <strong
                          style={{
                            direction: "ltr",
                            unicodeBidi: "bidi-override",
                          }}
                          clasName="certificate-number"
                        >
                          {result.certificateNumber}
                        </strong>
                      </p>
                    </div>

                    {result.certificateData && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                          {isMembershipInquery
                            ? t(
                              "certificateInquiry.membershipCertificateDetails"
                            )
                            : t("certificateInquiry.certificateDetails")}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {t("certificateInquiry.issueDate")}:
                            </span>
                            <span className="mr-2 text-gray-800 dark:text-gray-200">
                              {new Date(
                                result.certificateData.created_at
                              ).toLocaleDateString("en-US")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {t("certificateInquiry.approvalDate")}:
                            </span>
                            <span className="mr-2 text-gray-800 dark:text-gray-200">
                              {result.certificateData.approved_at
                                ? new Date(
                                  result.certificateData.updated_at
                                ).toLocaleDateString("en-US")
                                : new Date(
                                  result.certificateData.created_at
                                ).toLocaleDateString("en-US")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {t("certificateInquiry.status")}:
                            </span>
                            <span className="mr-2 text-green-600 dark:text-green-400 font-medium">
                              {result.certificateData.status === "PAID"
                                ? t("certificateInquiry.paid")
                                : result.certificateData.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                              {t("certificateInquiry.serialNumber")}:
                            </span>
                            <span
                              style={{
                                direction: "ltr",
                                unicodeBidi: "bidi-override",
                              }}
                              className="mr-2 text-gray-800 dark:text-gray-200"
                            >
                              {result.certificateData.serial_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleViewCertificate}
                        className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        {t("certificateInquiry.viewCertificate")}
                      </button>
                      <button
                        onClick={handleTryAgain}
                        className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {t("certificateInquiry.searchAgain")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-red-600 dark:text-red-400"
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
                      </div>
                      <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                          {isMembershipInquery
                            ? t("certificateInquiry.membershipNotFound")
                            : t("certificateInquiry.notFound")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {isMembershipInquery
                            ? t("certificateInquiry.membershipNotFoundMessage")
                            : t("certificateInquiry.notFoundMessage")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                          {isMembershipInquery
                            ? t("certificateInquiry.membershipCertificateNumber")
                            : t("certificateInquiry.certificateNumber")}
                          :{" "}
                        <strong
                          className="certificate-number"
                          style={{
                            direction: "ltr",
                            unicodeBidi: "bidi-override",
                          }}
                        >
                          {result.certificateNumber}
                        </strong>
                      </p>
                    </div>

                    <button
                      onClick={handleTryAgain}
                      className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {t("certificateInquiry.tryAgain")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CertificateInquiryPage;
