import React, { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useNavigate } from "react-router-dom";
import { translations } from "../i18n/locales";
import {
  getCertificateById,
  CertificateData,
} from "../services/certificates/certificateService";
import { getCurrentUser } from "../services/authService";

// CSS styles for editable fields
const editableFieldStyles = {
  border: "none",
  borderBottom: "1px dotted #000",
  background: "transparent",
  outline: "none",
  fontFamily: "'Cairo', sans-serif",
  textAlign: "center" as const,
  transition: "all 0.3s ease",
};
// import { DocumentRequest, CertificateOfOriginData } from '../types';
// import { getAllRequests } from '../services/requestService';
// import { useAuth } from '../contexts/AuthContext';

// Translation hook
const useTranslations = () => {
  const t = (key: string, language: "en" | "fr" | "ar" = "en") => {
    return translations[language]?.comesa?.[key] || key;
  };

  return { t };
};

// interface FreeTradeCertificateProps {
//   documentRequests?: DocumentRequest[];
//   requestId?: string;
// }

// Main component
const FreeTradeCertificate: React.FC = () => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [leftLogo, setLeftLogo] = useState<string | null>(
    "/src/images/free-trade-print/free-trade-logo-left.png"
  );
  const [rightLogo, setRightLogo] = useState<string | null>(
    "/src/images/free-trade-print/free-trade-logo-right.png"
  );
  const [qrData, setQrData] = useState<string>("");
  const [uniqueId, setUniqueId] = useState<string>("");

  // Certificate data states
  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  // API Response Modal states
  const [showApiResponseModal, setShowApiResponseModal] =
    useState<boolean>(false);
  const [apiResponseData, setApiResponseData] = useState<any>(null);

  // Editable fields state
  const [editableFields, setEditableFields] = useState({
    chamber_name: "",
    certificate_number: "",
    total_value: "",
    value_percentage: "",
    issue_place_signature: "",
    issue_date_signature: "",
    certifying_authority: "",
    goods_origin: "",
    issue_place_certification: "",
    issue_date_certification: "",
    invoice_number: "",
    invoice_date_gregorian: "",
    invoice_date_hijri: "",
  });

  // Parse foreign cost items from JSON string
  const parseForeignCostItems = () => {
    try {
      if (certificateData?.foreign_items_cost) {
        return JSON.parse(certificateData.foreign_items_cost);
      }
      return [];
    } catch (error) {
      console.error("Error parsing foreign cost items:", error);
      return [];
    }
  };

  // Calculate totals for foreign cost items
  const calculateForeignItemsTotals = () => {
    const foreignItems = parseForeignCostItems();
    const totalQuantity = foreignItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalValue = foreignItems.reduce(
      (sum, item) => sum + (item.value || 0),
      0
    );

    console.log("Foreign Items Totals:", {
      totalQuantity,
      totalValue,
      items: foreignItems,
    });
    return { totalQuantity, totalValue };
  };

  // Parse free trade extra data from JSON string
  // Expected format: {"total_value_text":"مائة ألف دينار تونسي (100,000 د.ت)","total_value":100000,"origin_declaration":"نحن نصرح بأن البضائع المذكورة أعلاه منشأها تونس","value_added_percentage":"75%","issue_place":"منفذ طرابلس","issue_date":"2024-01-20","certifying_authority":"مصلحة الجمارك التونسية","goods_origin":"تونس"}
  const parseFreeTradeExtraData = () => {
    try {
      console.log("🔍 Parsing Free Trade Extra Data...");
      console.log("📋 Certificate Data:", certificateData);
      console.log("📋 Extra field exists:", !!certificateData?.extra);
      console.log(
        "📋 Free Trade Extra Data field exists:",
        !!certificateData?.free_trade_extra_data
      );

      // First try to get from extra field (new format)
      if (certificateData?.extra) {
        console.log("📋 Raw extra data:", certificateData.extra);
        const parsed = JSON.parse(certificateData.extra);
        console.log("✅ Parsed extra data from 'extra' field:", parsed);
        console.log("📦 Quantity from extra:", parsed.quantity);
        console.log("💰 Item Cost from extra:", parsed.item_cost);
        console.log("💰 Total Value from extra:", parsed.total_value);
        return parsed;
      }
      // Fallback to free_trade_extra_data (old format)
      if (certificateData?.free_trade_extra_data) {
        console.log(
          "📋 Raw free_trade_extra_data:",
          certificateData.free_trade_extra_data
        );
        const parsed = JSON.parse(certificateData.free_trade_extra_data);
        console.log(
          "✅ Parsed extra data from 'free_trade_extra_data' field:",
          parsed
        );
        return parsed;
      }
      console.log("❌ No extra data found");
      return {};
    } catch (error) {
      console.error("❌ Error parsing free trade extra data:", error);
      return {};
    }
  };

  // Handle editable field changes
  const handleEditableFieldChange = (fieldName: string, value: string) => {
    setEditableFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Get branch information from localStorage
  const getBranchFromLocalStorage = () => {
    try {
      const user = getCurrentUser();
      console.log("Current user:", user);
      if (user && user.branch) {
        console.log("User branch:", user.branch);
        return user.branch.name || "";
      }
      return "";
    } catch (error) {
      console.error("Error getting branch from localStorage:", error);
      return "";
    }
  };

  // Convert Gregorian date to Hijri date
  const convertToHijri = (date: Date) => {
    try {
      // Simple conversion (approximate)
      const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
      return hijriDate;
    } catch (error) {
      console.error("Error converting to Hijri:", error);
      return "";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const gregorian = date.toLocaleDateString("en-GB"); // Use English format for Gregorian
      const hijri = convertToHijri(date);
      return {
        gregorian,
        hijri,
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return {
        gregorian: "",
        hijri: "",
      };
    }
  };

  // Initialize editable fields when certificate data is loaded
  // Mapping from extra data:
  // - issue_place -> chamber_name, issue_place_signature, issue_place_certification
  // - total_value_text -> total_value
  // - value_added_percentage -> value_percentage
  // - issue_date -> issue_date_signature, issue_date_certification
  // - certifying_authority -> certifying_authority
  // - goods_origin -> goods_origin
  // Branch information comes from localStorage (user.branch)
  useEffect(() => {
    if (certificateData) {
      const extraData = parseFreeTradeExtraData();
      const branchName = getBranchFromLocalStorage();

      // Format invoice date if available
      const invoiceDateInfo = certificateData.invoice_date
        ? formatDate(certificateData.invoice_date)
        : { gregorian: "", hijri: "" };

      setEditableFields({
        chamber_name: branchName || extraData.issue_place || "",
        certificate_number:
          certificateData.serial_number ||
          certificateData.certificate_number ||
          certificateData.serialNumber ||
          "",
        total_value: extraData.total_value_text || "",
        value_percentage: extraData.value_added_percentage || "",
        issue_place_signature: branchName || extraData.issue_place || "",
        issue_date_signature: extraData.issue_date
          ? new Date(extraData.issue_date).toLocaleDateString("ar-SA")
          : "",
        certifying_authority:
          extraData.certifying_authority || branchName || "",
        goods_origin: extraData.goods_origin || "",
        issue_place_certification: branchName || extraData.issue_place || "",
        issue_date_certification: extraData.issue_date
          ? new Date(extraData.issue_date).toLocaleDateString("ar-SA")
          : "",
        invoice_number: certificateData.invoice_number || "",
        invoice_date_gregorian: invoiceDateInfo.gregorian,
        invoice_date_hijri: invoiceDateInfo.hijri,
      });

      // Log certificate number assignment
      console.log("🔢 Certificate Number Assignment:");
      console.log("  - serial_number:", certificateData.serial_number);
      console.log(
        "  - certificate_number:",
        certificateData.certificate_number
      );
      console.log("  - serialNumber:", certificateData.serialNumber);
      console.log(
        "  - Final certificate_number:",
        certificateData.serial_number ||
          certificateData.certificate_number ||
          certificateData.serialNumber ||
          ""
      );
    }
  }, [certificateData]);

  // Data fetching states (commented out for now)
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  // const [requests, setRequests] = useState<DocumentRequest[]>([]);
  // const [currentRequest, setCurrentRequest] = useState<DocumentRequest | null>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Free Trade Certificate",
    contentRef: certificateRef,
    pageStyle: `
      @page {
        margin: 0;
        direction: rtl;
        size: A4;
      }
      @media print {
        * {
          direction: rtl !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          -webkit-box-sizing: border-box !important;
          box-sizing: border-box !important;
        }
        html, body {
          direction: rtl !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
          background: white !important;
        }
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0.3cm !important;
          box-sizing: border-box !important;
          transform: scale(0.9) !important;
          transform-origin: top center !important;
          page-break-inside: avoid !important;
        }
        table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          page-break-inside: avoid !important;
        }
        td, th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
        }
        .watermark {
          page-break-inside: avoid !important;
        }
        input[type="text"] {
          border: none !important;
          border-bottom: 1px dotted #000 !important;
          background: transparent !important;
          outline: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        @media print and (max-width: 21cm) {
          .print-container {
            transform: scale(0.85) !important;
          }
        }
      }
    `,
  });

  // Generate QR code
  const generateQrCode = useCallback(() => {
    try {
      const newUniqueId =
        "FT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

      // Use qr_identifier from certificateData if available, otherwise use id
      const qrIdentifier = certificateData?.qr_identifier || id;

      // Generate public URL for the certificate using qr_identifier
      const publicUrl = `${window.location.origin}/#/public/certificate/free-trade/${qrIdentifier}`;

      const qrDataObj = {
        uniqueId: newUniqueId,
        serialNo: "SN-" + Math.floor(Math.random() * 10000),
        exporter: "Sample Exporter Company",
        publicUrl: publicUrl,
      };

      setUniqueId(newUniqueId);
      setQrData(publicUrl); // Use the public URL directly for QR code
    } catch (e) {
      console.error(e);
      alert("An error occurred while generating the QR code.");
    }
  }, [id, certificateData?.qr_identifier]);

  // Certificate data fetching effect
  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!id) {
        console.log("No certificate ID provided in URL");
        return;
      }

      const certificateId = parseInt(id, 10);
      if (isNaN(certificateId)) {
        console.error("Invalid certificate ID:", id);
        setCertificateError("Invalid certificate ID");
        return;
      }

      // Check authentication first
      const user = getCurrentUser();
      if (!user || !user.accessToken) {
        console.error("User not authenticated");
        setCertificateError("يجب تسجيل الدخول أولاً للوصول إلى بيانات الشهادة");
        return;
      }

      setCertificateLoading(true);
      setCertificateError(null);

      try {
        console.log("Fetching certificate data for ID:", certificateId);
        console.log("User authenticated:", {
          userId: user.id,
          userRole: user.role,
        });

        const data = await getCertificateById(certificateId);

        console.log("Certificate data fetched successfully:", data);
        console.log("Certificate data - extra field:", data.extra);
        console.log(
          "Certificate data - free_trade_extra_data field:",
          data.free_trade_extra_data
        );
        console.log("Certificate data - serial_number:", data.serial_number);
        console.log(
          "Certificate data - certificate_number:",
          data.certificate_number
        );
        console.log("Certificate data - serialNumber:", data.serialNumber);
        setCertificateData(data);

        // Store API response for testing modal
        setApiResponseData(data);

        // Log specific fields that might be useful
        console.log("Certificate Details:", {
          id: data.id,
          title: data.title,
          client_name: data.client_name,
          request_id: data.request_id,
          invoice_number: data.invoice_number,
          company_name: data.company_name,
          identity_number: data.identity_number,
          mobile_number: data.mobile_number,
          created_at: data.created_at,
        });
      } catch (error) {
        console.error("Error fetching certificate data:", error);

        // Handle specific authentication errors
        if (
          error instanceof Error &&
          error.message.includes("UNAUTHENTICATED")
        ) {
          setCertificateError(
            "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى"
          );
        } else {
          // Redirect to 404 page for all other errors (NOT_FOUND, Internal server error, etc.)
          console.log("Redirecting to 404 page due to error:", error);
          navigate("/404");
        }
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificateData();
  }, [id, navigate]);

  // Generate QR code when component loads
  useEffect(() => {
    if (id) {
      generateQrCode();
    }
  }, [id, generateQrCode]);

  // Disable right-click and certain keyboard shortcuts
  useEffect(() => {
    const disableContextMenu = (event: MouseEvent) => event.preventDefault();
    const disableShortcuts = (event: KeyboardEvent) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["I", "J", "C"].includes(event.key.toUpperCase())) ||
        (event.ctrlKey && ["S", "U", "P"].includes(event.key.toUpperCase()))
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("keydown", disableShortcuts);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, []);

  // Show loading state
  if (certificateLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "8px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              marginBottom: "3px",
              color: "#333",
            }}
          >
            جاري تحميل بيانات الشهادة...
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #1976d2",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
      </div>
    );
  }

  // Show error state
  if (certificateError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "8px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              marginBottom: "3px",
              color: "#d32f2f",
            }}
          >
            خطأ في تحميل الشهادة
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "2px",
            }}
          >
            {certificateError}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          direction: "rtl",
          fontFamily: "'Times New Roman', serif",
          backgroundColor: "#ccc",
          margin: 0,
          padding: "20px",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {/* Print Button - sticky inside page */}
        <div
          style={{
            position: "sticky",
            top: "20px",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2px",
            gap: "10px",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            طباعة / Print
          </button>

          {/* API Response Button for Testing */}
          {/* <button
            onClick={() => setShowApiResponseModal(true)}
            style={{
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            عرض API Response
          </button> */}
          {/* <button
            onClick={generateQrCode}
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            Generate QR Code
          </button> */}
        </div>

        {/* Certificate container */}
        <div
          ref={certificateRef}
          className="print-container"
          style={{
            width: "21cm",
            margin: "5px auto",
            backgroundColor: "white",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Single Page */}
          <div
            style={{
              width: "21cm",
              // minHeight: "29.7cm",
              border: "2px solid #000",
              padding: "0.4cm",
              backgroundColor: "white",
              boxSizing: "border-box",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Watermark */}
            <div
              className="watermark"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.1,
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              <img
                src={
                  rightLogo ||
                  "/src/images/free-trade-print/free-trade-logo-right.png"
                }
                alt="Watermark"
                style={{
                  width: "8cm",
                  height: "10cm",
                  objectFit: "contain",
                }}
              />
            </div>
            {/* Page 1 Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Header with logos */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "3px",
                  // borderBottom: "1px solid black",
                  paddingBottom: "2px",
                  maxWidth: "90%",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    fontSize: "12pt",
                    fontWeight: "bold",
                  }}
                >
                  {/* <img
                    src={
                      rightLogo ||
                      "/src/images/free-trade-print/free-trade-logo-right.png"
                    }
                    alt="Right Logo"
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                    }}
                  /> */}
                  <div
                    style={{
                      minHeight: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12pt",
                      fontWeight: "bold",
                    }}
                  >
                    دولة ليبيـــــــا
                  </div>
                </div>
                <div style={{ textAlign: "center", flexGrow: 1 }}>
                  {/* <div
                    style={{
                      fontSize: "12pt",
                      fontWeight: "bold",
                      marginBottom: "2px",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    دولة ليبيـــــــا
                  </div> */}
                  <div
                    style={{
                      fontSize: "14pt",
                      fontWeight: "bold",
                      marginBottom: "2px",
                      fontFamily: "'Cairo', sans-serif",
                      marginTop: "36px",
                    }}
                  >
                    شهــــــادة منشــــــــأ
                  </div>
                  <div
                    style={{
                      fontSize: "10pt",
                      marginBottom: "1px",
                      fontFamily: "'Cairo', sans-serif",
                      lineHeight: "1.2",
                    }}
                  >
                    بموجب إتفاقية منطقة تبادل حر الموقعة بين الجمهورية التونسية
                    ودولة ليبيا بتاريخ 2001/06/14
                  </div>
                </div>
                <div>
                  <img
                    src={
                      leftLogo ||
                      "/src/images/free-trade-print/free-trade-logo-left.png"
                    }
                    alt="Left Logo"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "9pt",
                  // fontWeight: "bold",
                  // marginBottom: "3px",
                  margin: "8px 0px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                صادرة عن مصلحة الجمارك الليبية /
                <input
                  type="text"
                  value={editableFields.chamber_name}
                  onChange={(e) =>
                    handleEditableFieldChange("chamber_name", e.target.value)
                  }
                  style={{
                    // ...editableFieldStyles,
                    fontSize: "9pt",
                    fontWeight: "bold",
                    width: "200px",
                  }}
                />{" "}
                رقم الشهادة:
                <input
                  type="text"
                  value={
                    certificateData?.serial_number ||
                    certificateData?.certificate_number ||
                    certificateData?.serialNumber ||
                    ""
                  }
                  readOnly
                  style={{
                    // ...editableFieldStyles,
                    fontSize: "9pt",
                    fontWeight: "bold",
                    width: "150px",
                    // backgroundColor: "#f9f9f9",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Company Information */}
              <div style={{ marginBottom: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "50%",
                          border: "1px solid black",
                          padding: "2px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "9pt",
                            fontWeight: "bold",
                          }}
                        >
                          الشركة المنتجة / المصدر وعنوانه /
                        </div>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            marginTop: "2px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "10pt",
                          }}
                        >
                          {certificateData?.exporter_name ||
                            certificateData?.title ||
                            "_________________________________"}
                        </div>
                      </td>
                      <td
                        style={{
                          width: "50%",
                          border: "1px solid black",
                          padding: "2px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "9pt",
                            fontWeight: "bold",
                          }}
                        >
                          رقم وتاريخ الفاتورة /
                        </div>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            marginTop: "2px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "10pt",
                          }}
                        >
                          <div style={{ marginBottom: "5px" }}>
                            رقم الفاتورة:{" "}
                            <input
                              type="text"
                              value={editableFields.invoice_number}
                              onChange={(e) =>
                                handleEditableFieldChange(
                                  "invoice_number",
                                  e.target.value
                                )
                              }
                              style={{
                                ...editableFieldStyles,
                                fontSize: "10pt",
                                width: "150px",
                                padding: "0 5px",
                              }}
                            />
                          </div>
                          <div
                            style={{ marginBottom: "5px", fontSize: "10pt" }}
                          >
                            التاريخ الهجري:{" "}
                            <input
                              type="text"
                              value={editableFields.invoice_date_hijri}
                              onChange={(e) =>
                                handleEditableFieldChange(
                                  "invoice_date_hijri",
                                  e.target.value
                                )
                              }
                              style={{
                                ...editableFieldStyles,
                                fontSize: "10pt",
                                width: "120px",
                                padding: "0 5px",
                              }}
                            />{" "}
                            /{" "}
                            <input
                              type="text"
                              value={editableFields.invoice_date_gregorian}
                              onChange={(e) =>
                                handleEditableFieldChange(
                                  "invoice_date_gregorian",
                                  e.target.value
                                )
                              }
                              style={{
                                ...editableFieldStyles,
                                fontSize: "10pt",
                                width: "120px",
                                padding: "0 5px",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          width: "50%",
                          border: "1px solid black",
                          padding: "2px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "9pt",
                            fontWeight: "bold",
                          }}
                        >
                          المستورد وعنوانه /
                        </div>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            marginTop: "2px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "10pt",
                          }}
                        >
                          {certificateData?.company_name ||
                            certificateData?.client_name ||
                            "_________________________________"}
                        </div>
                      </td>
                      <td
                        style={{
                          width: "50%",
                          border: "1px solid black",
                          padding: "2px",
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "9pt",
                            fontWeight: "bold",
                          }}
                        >
                          القيمة بالعملة المحلية
                        </div>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            marginTop: "2px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "10pt",
                          }}
                        >
                          {parseFreeTradeExtraData()?.total_value
                            ? `${
                                parseFreeTradeExtraData().total_value
                              } دينار ليبي`
                            : certificateData?.item_cost
                            ? `${certificateData.item_cost} دينار ليبي`
                            : "_________________________________"}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Goods Table */}
              <div
                style={{
                  // padding: "10px",
                  fontFamily: "'Cairo', sans-serif",
                  direction: "rtl",
                }}
              >
                <div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid black",
                      fontSize: "10pt",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            width: "30%",
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          عدد ونوع وأرقام وعلامات الطرود
                        </th>
                        <th
                          style={{
                            width: "25%",
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          نوع البضاعة
                        </th>
                        <th
                          style={{
                            width: "15%",
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          الوزن
                        </th>
                        <th
                          style={{
                            width: "10%",
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          الكمية
                        </th>
                        <th
                          style={{
                            width: "20%",
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          القيمة بالعملة المحلية
                        </th>
                      </tr>
                      <tr>
                        <th
                          style={{
                            border: "1px solid black",
                            borderBottom: "none",
                            padding: "1px",
                            fontSize: "10pt",
                          }}
                        ></th>
                        <th
                          style={{
                            border: "1px solid black",
                            borderBottom: "none",
                            padding: "1px",
                            fontSize: "10pt",
                          }}
                        ></th>
                        <th
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "stretch",
                              height: "100%",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "6pt",
                              }}
                            >
                              القائم
                            </div>
                            <div
                              style={{
                                width: "1px",
                                backgroundColor: "#888",
                                margin: "0 5px",
                              }}
                            ></div>
                            <div
                              style={{
                                flex: 1,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "6pt",
                              }}
                            >
                              الصافي
                            </div>
                          </div>
                        </th>
                        <th
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                          }}
                        ></th>
                        <th
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            fontSize: "10pt",
                          }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ height: "30px" }}>
                        <td
                          style={{
                            height: "12px",
                            border: "1px solid black",
                            padding: "1px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              // border: "1px solid #ccc",
                              // padding: "1px",
                              // minHeight: "8px",
                              // backgroundColor: "#f9f9f9",
                              fontSize: "7pt",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            {certificateData?.signs || "________________"}
                          </div>
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              // border: "1px solid #ccc",
                              // padding: "1px",
                              // minHeight: "8px",
                              // backgroundColor: "#f9f9f9",
                              fontSize: "7pt",
                              fontFamily: "'Cairo', sans-serif",
                              textAlign: "center",
                            }}
                          >
                            {certificateData?.activity_type ||
                              "________________"}
                          </div>
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "stretch",
                              height: "100%",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                fontSize: "7pt",
                                fontFamily: "'Cairo', sans-serif",
                                paddingTop: "1.5px",
                              }}
                            >
                              {certificateData?.weight || ""}
                            </div>
                            <div
                              style={{
                                width: "1px",
                                backgroundColor: "#888",
                                margin: "0 5px",
                                height: "50px",
                              }}
                            ></div>
                            <div
                              style={{
                                flex: 1,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                fontSize: "7pt",
                                fontFamily: "'Cairo', sans-serif",
                                paddingTop: "1.5px",
                              }}
                            >
                              {certificateData?.net_weight || ""}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              // border: "1px solid #ccc",
                              padding: "1px",
                              minHeight: "8px",
                              // backgroundColor: "#f9f9f9",
                              fontSize: "7pt",
                              fontFamily: "'Cairo', sans-serif",
                              textAlign: "center",
                            }}
                          >
                            {parseFreeTradeExtraData()?.quantity ||
                              certificateData?.quantity ||
                              "________________"}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "2px",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              // border: "1px solid #ccc",
                              // padding: "1px",
                              // minHeight: "12px",
                              // backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "center",
                            }}
                          >
                            <input
                              type="text"
                              value={
                                parseFreeTradeExtraData()?.total_value
                                  ? `${parseFreeTradeExtraData().total_value}  `
                                  : certificateData?.item_cost
                                  ? `${certificateData.item_cost}  `
                                  : ""
                              }
                              onChange={(e) => {
                                // Update item_cost in certificate data
                                if (certificateData) {
                                  setCertificateData({
                                    ...certificateData,
                                    item_cost: e.target.value.replace(
                                      " دينار ليبي",
                                      ""
                                    ),
                                  });
                                }
                              }}
                              style={{
                                ...editableFieldStyles,
                                fontSize: "7pt",
                                width: "100%",
                                textAlign: "center",
                                border: "none",
                                background: "transparent",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Certificate Information */}
              <div
                style={{
                  border: "1px solid black",
                  padding: "2px",
                  marginBottom: "3px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {/* <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "9pt",
                    fontWeight: "bold",
                    marginBottom: "3px",
                  }}
                >
                  صادرة عن مصلحة الجمارك الليبية /
                  <input
                    type="text"
                    value={editableFields.chamber_name}
                    onChange={(e) =>
                      handleEditableFieldChange("chamber_name", e.target.value)
                    }
                    style={{
                      ...editableFieldStyles,
                      fontSize: "9pt",
                      fontWeight: "bold",
                      width: "200px",
                    }}
                  />{" "}
                  .. رقم الشهادة:
                  <input
                    type="text"
                    value={
                      certificateData?.serial_number ||
                      certificateData?.certificate_number ||
                      certificateData?.serialNumber ||
                      ""
                    }
                    readOnly
                    style={{
                      ...editableFieldStyles,
                      fontSize: "9pt",
                      fontWeight: "bold",
                      width: "150px",
                      backgroundColor: "#f9f9f9",
                      cursor: "not-allowed",
                    }}
                  />
                </div> */}

                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "9pt",
                    fontWeight: "bold",
                    marginBottom: "3px",
                  }}
                >
                  القيمة الإجمالية رقما وكتابة:{" "}
                  <input
                    type="text"
                    value={editableFields.total_value}
                    onChange={(e) =>
                      handleEditableFieldChange("total_value", e.target.value)
                    }
                    style={{
                      ...editableFieldStyles,
                      fontSize: "9pt",
                      fontWeight: "bold",
                      width: "400px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Page 2 Content - Merged */}
            <div style={{ position: "relative", zIndex: 2, marginTop: "1px" }}>
              {/* Cost Elements Table */}
              <div style={{ marginBottom: "8px" }}>
                <h3
                  style={{
                    fontSize: "10pt",
                    fontWeight: "bold",
                    marginBottom: "3px",
                    fontFamily: "'Cairo', sans-serif",
                    textAlign: "center",
                  }}
                >
                  بيــــــــــــــــــــــــــان عناصر
                  الإنتـــــــــــــــــــــــــــــــــــــــــاج{" "}
                </h3>

                <p
                  style={{
                    fontSize: "10pt",
                    // fontWeight: "bold",
                    marginBottom: "3px",
                    fontFamily: "'Cairo', sans-serif",
                    textAlign: "flex-start",
                  }}
                >
                  تصريح المصدر: أصرح بصحة المعلومات الواردة أعلاه، وبأن البضائع
                  هي من:
                </p>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid black",
                    marginBottom: "1px",
                    fontSize: "10pt",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "60%",
                          border: "1px solid black",
                          padding: "2px",
                          fontSize: "10pt",
                          fontFamily: "'Cairo', sans-serif",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        عناصر التكلفة الأجنبية
                      </th>
                      <th
                        style={{
                          width: "20%",
                          border: "1px solid black",
                          padding: "2px",
                          fontSize: "10pt",
                          fontFamily: "'Cairo', sans-serif",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        الكمية
                      </th>
                      <th
                        style={{
                          width: "20%",
                          border: "1px solid black",
                          padding: "2px",
                          fontSize: "10pt",
                          fontFamily: "'Cairo', sans-serif",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        القيمة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseForeignCostItems()?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            height: "20px",
                          }}
                        >
                          {/* <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "1px",
                              minHeight: "8px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          > */}
                          {index + 1}- {item.description || ""}
                          {/* </div> */}
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            textAlign: "center",
                          }}
                        >
                          {/* <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "5px",
                              minHeight: "30px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              textAlign: "center",
                            }}
                          > */}
                          {item.quantity || "________"}
                          {/* </div> */}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "2px" }}
                        >
                          {/* <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "5px",
                              minHeight: "30px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              textAlign: "center",
                            }}
                          > */}
                          <input
                            type="text"
                            value={item.value || ""}
                            onChange={(e) => {
                              // Update the item value in the foreign cost items
                              const updatedItems = parseForeignCostItems()?.map(
                                (itm: any, idx: number) =>
                                  idx === index
                                    ? { ...itm, value: e.target.value }
                                    : itm
                              );
                              // Update the certificate data with the new foreign cost items
                              if (certificateData) {
                                setCertificateData({
                                  ...certificateData,
                                  foreign_items_cost:
                                    JSON.stringify(updatedItems),
                                });
                              }
                            }}
                            style={{
                              ...editableFieldStyles,
                              fontSize: "7pt",
                              width: "100%",
                              textAlign: "center",
                              border: "none",
                              background: "transparent",
                            }}
                          />
                          {/* </div> */}
                        </td>
                      </tr>
                    ))}
                    {/* Add empty rows if needed to fill up to 3 rows */}
                    {Array.from({
                      length: Math.max(0, 3 - parseForeignCostItems()?.length),
                    })?.map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "1px",
                            height: "20px",
                          }}
                        >
                          <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "1px",
                              minHeight: "8px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          >
                            {parseForeignCostItems()?.length + index + 1}-
                          </div>
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "2px" }}
                        >
                          <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "5px",
                              minHeight: "30px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              textAlign: "center",
                            }}
                          >
                            <input
                              type="text"
                              value=""
                              onChange={(e) => {
                                // Add new item to foreign cost items
                                const currentItems = parseForeignCostItems();
                                const newItem = {
                                  quantity: "",
                                  value: e.target.value,
                                };
                                const updatedItems = [...currentItems, newItem];
                                // Update the certificate data with the new foreign cost items
                                if (certificateData) {
                                  setCertificateData({
                                    ...certificateData,
                                    foreign_items_cost:
                                      JSON.stringify(updatedItems),
                                  });
                                }
                              }}
                              style={{
                                ...editableFieldStyles,
                                fontSize: "7pt",
                                width: "100%",
                                textAlign: "center",
                                border: "none",
                                background: "transparent",
                              }}
                            />
                          </div>
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "2px" }}
                        >
                          {/* <div
                            style={{
                              border: "1px solid #ccc",
                              padding: "5px",
                              minHeight: "30px",
                              backgroundColor: "#f9f9f9",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              textAlign: "center",
                            }}
                          > */}
                          ________
                          {/* </div> */}
                        </td>
                      </tr>
                    ))}
                    {/* <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "2px",
                          height: "20px",
                        }}
                      >
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          4- عائدات لجهة أجنية
                        </div>
                      </td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          ________
                        </div>
                      </td>
                      <td style={{ border: "1px solid black", padding: "8px" }}>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          ________
                        </div>
                      </td>
                    </tr> */}
                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "0px 2px",
                          height: "12px",
                          textAlign: "flex-start",
                          fontWeight: "bold",
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "9pt",
                        }}
                      >
                        المجموع
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "0px",
                          textAlign: "center",
                        }}
                      >
                        {/* <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                            textAlign: "center",
                          }}
                        > */}
                        {calculateForeignItemsTotals().totalQuantity ||
                          "________"}
                        {/* </div> */}
                      </td>
                      <td style={{ border: "1px solid black", padding: "0px" }}>
                        {/* <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                          }}
                        ></div> */}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "0px 2px",
                          height: "12px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "9pt",
                        }}
                      >
                        التكلفة النهائية للإنتاج
                      </td>
                      <td style={{ border: "1px solid black", padding: "0px" }}>
                        {/* <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                          }}
                        ></div> */}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "0px",
                          textAlign: "center",
                        }}
                      >
                        {/* <div
                          style={{
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "15px",
                            backgroundColor: "#f9f9f9",
                            textAlign: "center",
                          }}
                        > */}
                        {calculateForeignItemsTotals().totalValue || "________"}
                        {/* </div> */}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Production Elements */}
              {/* <div style={{ marginBottom: "8px" }}>
              <h3
                style={{
                  fontSize: "12pt",
                  fontWeight: "bold",
                  marginBottom: "3px",
                  fontFamily: "'Cairo', sans-serif",
                  textAlign: "center",
                }}
              >
                بيــــــــــــــــــــــــــان عناصر
                الإنتـــــــــــــــــــــــــــــــــــــــــاج
              </h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid black",
                  marginBottom: "3px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        width: "60%",
                        border: "1px solid black",
                        padding: "2px",
                                fontSize: "12pt",
                        fontFamily: "'Cairo', sans-serif",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      التكلفة النهائية للإنتاج
                    </th>
                    <th
                      style={{
                        width: "40%",
                        border: "1px solid black",
                        padding: "2px",
                                fontSize: "12pt",
                        fontFamily: "'Cairo', sans-serif",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      القيمة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "2px",
                        height: "40px",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "2px",
                        height: "40px",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "2px",
                        height: "40px",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "2px",
                        height: "40px",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <div
                        style={{
                          border: "1px solid #ccc",
                          padding: "5px",
                          minHeight: "30px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        ...............................
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> */}

              {/* Declaration Section */}

              {/* <br />
              <br />
              <br /> */}

              <div
                style={{
                  padding: "2px",
                  marginBottom: "2px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                    marginBottom: "3px",
                  }}
                >
                  تصريح المصدر:{" "}
                  <span
                    style={{
                      borderBottom: "1px dotted #000",
                      padding: "0 50px",
                    }}
                  >
                    {parseFreeTradeExtraData().origin_declaration ||
                      certificateData?.standard_of_origin ||
                      "_________________"}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                    marginBottom: "2px",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  وأن(أ):
                  <div>
                    <span>☐</span> القيمة المضافة المحلية
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "10pt",
                        marginTop: "5px",
                      }}
                    >
                      تمثل نسبة (رقما وكتابة){" "}
                      <input
                        type="text"
                        value={editableFields.value_percentage}
                        onChange={(e) =>
                          handleEditableFieldChange(
                            "value_percentage",
                            e.target.value
                          )
                        }
                        style={{
                          ...editableFieldStyles,
                          fontSize: "10pt",
                          width: "100px",
                          padding: "0 10px",
                        }}
                      />{" "}
                      من كلفة الإنتاج الكلية
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "10pt",
                        marginTop: "5px",
                      }}
                    >
                      حرر في{" "}
                      <input
                        type="text"
                        value={editableFields.issue_place_signature}
                        onChange={(e) =>
                          handleEditableFieldChange(
                            "issue_place_signature",
                            e.target.value
                          )
                        }
                        style={{
                          ...editableFieldStyles,
                          fontSize: "10pt",
                          width: "250px",
                          padding: "0 10px",
                        }}
                      />{" "}
                      التوقيع
                    </div>
                  </div>
                  <div>
                    <span>☐</span>القيمة المضافة المغاربية
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "10pt",
                        marginTop: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <span> بتاريخ </span>
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "8pt",
                          width: "120px",
                          padding: "0 10px",
                          display: "inline-block",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            borderBottom: "1px dotted #000",
                            paddingBottom: "2px",
                          }}
                        >
                          {editableFields.issue_date_signature}
                        </div>
                        <div
                          style={{
                            fontSize: "8pt",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          {parseFreeTradeExtraData()?.issue_date
                            ? new Date(
                                parseFreeTradeExtraData().issue_date
                              ).toLocaleDateString("en-GB")
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr style={{ border: "1px solid #000", margin: "5px 0" }} />

              {/* Certification Section */}
              <div
                style={{
                  padding: "2px",
                  marginBottom: "2px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                    marginBottom: "3px",
                  }}
                >
                  تشهد.{" "}
                  <input
                    type="text"
                    value={editableFields.certifying_authority}
                    onChange={(e) =>
                      handleEditableFieldChange(
                        "certifying_authority",
                        e.target.value
                      )
                    }
                    style={{
                      ...editableFieldStyles,
                      fontSize: "10pt",
                      width: "200px",
                      padding: "0 10px",
                    }}
                  />{" "}
                  بأن السلع الموضح بياناتها أعلاه هي من{" "}
                  {/* <input
                    type="text"
                    value={editableFields.goods_origin}
                    onChange={(e) =>
                      handleEditableFieldChange("goods_origin", e.target.value)
                    }
                    style={{
                      ...editableFieldStyles,
                      fontSize: "10pt",
                      width: "100px",
                      padding: "0 10px",
                    }}
                  />{" "} */}
                  {/* <br /> */}
                  منشأ:{" "}
                  <input
                    type="text"
                    value={editableFields.goods_origin}
                    onChange={(e) =>
                      handleEditableFieldChange("goods_origin", e.target.value)
                    }
                    style={{
                      ...editableFieldStyles,
                      fontSize: "10pt",
                      width: "100px",
                      padding: "0 10px",
                    }}
                  />{" "}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontSize: "10pt",
                    }}
                  >
                    حرر في{" "}
                    <input
                      type="text"
                      value={editableFields.issue_place_certification}
                      onChange={(e) =>
                        handleEditableFieldChange(
                          "issue_place_certification",
                          e.target.value
                        )
                      }
                      style={{
                        ...editableFieldStyles,
                        fontSize: "10pt",
                        width: "250px",
                        padding: "0 10px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontSize: "8pt",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span> بتاريخ </span>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "8pt",
                        width: "120px",
                        padding: "0 10px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          borderBottom: "1px dotted #000",
                          paddingBottom: "2px",
                        }}
                      >
                        {editableFields.issue_date_certification}
                      </div>
                      <div
                        style={{
                          fontSize: "8pt",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {parseFreeTradeExtraData()?.issue_date
                          ? new Date(
                              parseFreeTradeExtraData().issue_date
                            ).toLocaleDateString("en-GB")
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Signatures */}
              <div
                style={{
                  padding: "0px 8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ textAlign: "center", width: "48%" }}>
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "9pt",
                        fontWeight: "bold",
                        marginBottom: "3px",
                      }}
                    >
                      توقيع وختم مصلحة الجمارك الليبية
                    </div>
                    <div
                      style={{
                        border: "1px solid #000",
                        height: "40px",
                        marginBottom: "3px",
                      }}
                    ></div>
                  </div>

                  <div style={{ textAlign: "center", width: "48%" }}>
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "9pt",
                        fontWeight: "bold",
                        marginBottom: "3px",
                      }}
                    >
                      تأشيرة السلطات الجمركية
                    </div>
                    <div
                      style={{
                        border: "1px solid #000",
                        height: "40px",
                        marginBottom: "3px",
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: "5px" }}>
                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontSize: "9pt",
                      fontWeight: "bold",
                      marginBottom: "3px",
                    }}
                  >
                    توقيع وختم الجهة المصادقة
                  </div>
                  <div
                    style={{
                      border: "1px solid #000",
                      height: "40px",
                      marginBottom: "3px",
                    }}
                  ></div>
                </div>

                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                    marginBottom: "5px",
                  }}
                >
                  (أ): وضع علامة (X) في الخانة المناسبة
                </div>
              </div>
            </div>

            {/* New Section: QR Code and Certificate Number */}
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "3px",
                padding: "2px 4px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >

              <div style={{ flex: 1, textAlign: "right" }}>
                <h3
                  style={{
                    fontSize: "7pt",
                    fontWeight: "bold",
                    margin: "0 0 2px 0",
                    color: "#333",
                    textAlign: "center",
                  }}
                >
                  Certificate Number
                </h3>
                <p
                  style={{
                    fontSize: "9pt",
                    fontWeight: "bold",
                    margin: "0",
                    color: "#1976d2",
                    fontFamily: "monospace",
                    textAlign: "center",
                  }}
                >
                  {certificateData?.serialNumber ||
                    certificateData?.serial_number ||
                    certificateData?.certificate_number ||
                    "- - - -"}
                </p>
              </div>

  
              <div style={{ flex: 1, textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "7pt",
                    fontWeight: "bold",
                    margin: "0 0 2px 0",
                    color: "#333",
                  }}
                >
                  Verification QR Code
                </h3>
                {qrData && (
                  <QRCodeSVG
                    value={qrData}
                    size={80}
                    level="M"
                    includeMargin
                    style={{ margin: "0 auto" }}
                  />
                )}
                <p
                  style={{
                    fontSize: "7pt",
                    color: "#999",
                    textAlign: "center",
                    margin: "1px 0 0 0",
                  }}
                >
                  Scan to verify certificate
                </p>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/* API Response Modal */}
      {showApiResponseModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowApiResponseModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2px",
                borderBottom: "1px solid #eee",
                paddingBottom: "2px",
              }}
            >
              <h2 style={{ margin: 0, color: "#333" }}>API Response Data</h2>
              <button
                onClick={() => setShowApiResponseModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "20px" }} dir="ltr">
              <h3 style={{ margin: "0 0 10px 0", color: "#555" }}>
                Complete API Response:
              </h3>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "2px",
                  borderRadius: "5px",
                  overflow: "auto",
                  fontSize: "12px",
                  lineHeight: "1.4",
                  border: "1px solid #ddd",
                  maxHeight: "80vh",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(apiResponseData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FreeTradeCertificate;
