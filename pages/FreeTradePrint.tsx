import React, { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { useParams, useNavigate } from "react-router-dom";
import { translations } from "../i18n/locales";
import {
  getCertificateById,
  CertificateData,
} from "../services/certificates/certificateService";
import { getCurrentUser } from "../services/authService";
import {
  Header,
  MainInfoTable,
  ForeignCostTable,
  DeclarationSection,
  CertificationSection,
  CustomsEndorsement,
  Footer,
} from "../components/certificates/print/freeTrade";

// CSS styles for editable fields
const editableFieldStyles = {
  border: "none",
  // borderBottom: "1px dotted #000",
  background: "transparent",
  outline: "none",
  // fontFamily: "'Cairo', sans-serif",
  textAlign: "right" as const,
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
    "/images/free-trade-print/free-trade-logo-left.png"
  );
  const [rightLogo, setRightLogo] = useState<string | null>(
    "/images/free-trade-print/free-trade-logo-right.png"
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
      margin: 0 !important;
      padding: 0 !important;
      size: A4;
      width: 100% !important;
      height: 100% !important;
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
        min-height: 100vh !important;
        max-width: 100% !important;
        max-height: 100% !important;
        overflow: visible !important;
        background: white !important;
      }

     

      .print-container {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        transform: none !important;
        transform-origin: top left !important;
        min-height: 100vh !important;
        background: white !important;
        position: relative !important;
        overflow: visible !important;
      }
     


.print-container-inner {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  background: white !important;
  position: relative !important;
}


      table {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        background: white !important;
      }
      td, th {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: auto !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .watermark {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        opacity: 0.1 !important;
        z-index: 1 !important;
        pointer-events: none !important;
      }
      @media print and (max-width: 21cm) {
        .print-container {
          transform: none !important;
        }
      }
      
      /* Ensure full page coverage */
      @media print {
        .print-container {
          width: 100% !important;
          height: 100% !important;
          transform: none !important;
          transform-origin: top left !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Scale the certificate content to fit the page */
        .print-container-inner {
          transform: scale(.96) !important;
          transform-origin: top left !important;
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          margin: 0 !important;
          padding: 20rem 1rem 0 1rem !important;
        }
        
        /* Force Arabic text to right side in print */
        .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: bidi-override !important;
          margin-right: 20px !important;
          paddingTop: "20px" !important;
        }

        
        
        /* Ensure all absolutely positioned elements scale properly */
        // .print-container-inner > div {
        //   position: absolute !important;
        // }

         .print-container-inner-table{
          background-color: red !important;
          scale: 1.4 !important;
          direction: rtl !important;
          transform-origin: top left !important;
          transform: translateY(-30px) !important;
        }
        
        /* QR Code positioning for print */
        .print-container-inner-qr {
          position: absolute !important;
          top: 230px !important;
          left: 470px !important;
          width: 60px !important;
          height: 60px !important;
          // background-color: transparent !important;
        }

      

       
        
        /* Optimize text rendering for print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          font-weight: normal !important;
        }
        
        /* Override bold text in print */
        b, strong, .font-bold, [style*="font-weight: bold"], [style*="fontWeight: bold"] {
          font-weight: normal !important;
        }
        
        /* Set font family for print */
        * {
          font-family: "Times New Roman", Times, serif !important;
        }
        
        /* Remove border in print */
        .print-container > div {
          border: none !important;
        }
        
        /* Fix direction for specific sections in print */
        .serial-number-section {
          direction: ltr !important;
          text-align: left !important;
        }
        
        .reference-number-section {
          direction: ltr !important;
          text-align: left !important;
        }
        
        .reference-number-section span {
          direction: ltr !important;
          text-align: left !important;
        }
        
        /* Keep Arabic text direction as is in print */
        .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
        }
        
        /* Alternative targeting for Arabic span */
        .print-container-inner-table .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
        }
        
        /* More specific targeting */
        .reference-number-section .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
        }
        
        /* Force Arabic direction with highest priority */
        span.print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
        }
        
        /* Override any inherited direction */
        .print-container-inner-table span[class*="arabic"] {
          direction: rtl !important;
          text-align: right !important;
        }
        
        /* Ensure proper page breaks */
        .print-container {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Final override for Arabic text direction */
        .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: bidi-override !important;
          transform: translateX(20px) !important;
          display: inline-block !important;
          // width: 100% !important;
          display:flex;
          flex-direction: row-reverse;
        }


        .print-container-inner-right-logo{
        transform: translateX(20px) translateY(25px) !important;
        }

        .print-container-inner-left-logo{
        transform: translateX(15px) translateY(25px) !important;
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
              fontFamily: "'Cairo', sans-serif",
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
                  // border: "1px solid #000",
                  padding: "20px",
                  backgroundColor: "white",
                  boxSizing: "border-box",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
            {/* Page 1 Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <Header
                leftLogo={leftLogo}
                rightLogo={rightLogo}
                chamberName={editableFields.chamber_name}
                certificateNumber={
                    certificateData?.serial_number ||
                    certificateData?.certificate_number ||
                    certificateData?.serialNumber ||
                    ""
                  }
              />

              <MainInfoTable
                certificateData={certificateData}
                editableFields={editableFields}
                parseFreeTradeExtraData={parseFreeTradeExtraData}
              />
            </div>

            <p
              dir="rtl"
              style={{
                marginTop: "0pt",
                marginRight: "49.5pt",
                marginBottom: "0pt",
                textIndent: "-49.5pt",
                lineHeight: "110%",
                fontSize: "9.5pt",
              }}
            >
              <span dir="ltr">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span
                style={{ fontFamily: '"Khalid Art bold"', fontWeight: 700 }}
              >
                القيمة الإجمالية رقما
              </span>
              <span
                style={{ fontFamily: '"Khalid Art bold"', fontWeight: 700 }}
                dir="ltr"
              >
                &nbsp;
              </span>
              <span
                style={{ fontFamily: '"Khalid Art bold"', fontWeight: 700 }}
              >
                و
              </span>
              <span
                style={{ fontFamily: '"Khalid Art bold"', fontWeight: 700 }}
              >
                كتابة:
              </span>
              <span
                style={{
                  // borderBottom: "1px solid #000",
                  // display: "inline-block",
                  width: "300px",
                  marginRight: "10px",
                  height: "20px",
                  verticalAlign: "bottom",
                }}
              >
                {parseFreeTradeExtraData()?.total_value_text ||
                  (parseFreeTradeExtraData()?.total_value
                    ? `${parseFreeTradeExtraData().total_value} دينار ليبي`
                    : certificateData?.item_cost
                    ? `${certificateData.item_cost} دينار ليبي`
                    : "")}
              </span>
            </p>

            {/* Page 2 Content - Merged */}
            <div style={{ position: "relative", zIndex: 2, marginTop: "1px" }}>
              {/* Cost Elements Table */}
              <div style={{ marginBottom: "5px" }}>
                {/* Production Elements Section */}
                <p
                  dir="rtl"
                  style={{
                    marginTop: "8pt",
                    marginBottom: "5pt",
                    textAlign: "center",
                    lineHeight: "110%",
                    fontSize: "9.5pt",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'PT Bold Heading'",
                      fontWeight: "700",
                      fontSize: "1rem",
                  }}
                >
                  بيــــــــــــــــــــــــــان عناصر
                    الإنتـــــــــــــــــــــــــــــــــــــــــاج
                  </span>
                </p>

                {/* Exporter Declaration */}
                <p
                  dir="rtl"
                  style={{
                    marginTop: "8pt",
                    marginBottom: "5pt",
                    lineHeight: "110%",
                    fontSize: "9.5pt",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Khalid Art bold'",
                      fontWeight: "700",
                    }}
                  >
                    تصريح المصدر:
                  </span>
                  <span
                    style={{
                      fontFamily: "'Khalid Art bold'",
                      fontWeight: "700",
                    }}
                  >
                    أصرح بصحة المعلومات الواردة أعلاه، وبأن البضائع هي من منشأ
                  </span>
                  <span
                    style={{
                      // borderBottom: "1px solid black",
                      // display: "inline-block",
                      width: "200px",
                      marginRight: "10px",
                        height: "20px",
                        verticalAlign: "bottom",
                      }}
                  >
                    {parseFreeTradeExtraData()?.goods_origin ||
                      certificateData?.standard_of_origin ||
                      ""}
                    </span>
                  </p>

                <ForeignCostTable
                  parseForeignCostItems={parseForeignCostItems}
                  calculateForeignItemsTotals={calculateForeignItemsTotals}
                />

                <DeclarationSection
                  parseFreeTradeExtraData={parseFreeTradeExtraData}
                  certificateData={certificateData}
                />

                <div
                  style={{
                    margin: "15px 0",
                    borderBottom: "1.5px solid #000000",
                  }}
                ></div>

                <CertificationSection
                  parseFreeTradeExtraData={parseFreeTradeExtraData}
                  certificateData={certificateData}
                />

                <CustomsEndorsement />

                <Footer qrData={qrData} />
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
                  <h2 style={{ margin: 0, color: "#333" }}>
                    API Response Data
                  </h2>
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
        </div>
      </div>
    </>
  );
};

export default FreeTradeCertificate;
