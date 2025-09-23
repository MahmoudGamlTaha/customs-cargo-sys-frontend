import React, { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useNavigate } from "react-router-dom";
// import { translations } from "../i18n/locales";
import {
  getCertificateById,
  CertificateData,
} from "../services/certificates/certificateService";
import { getCurrentUser } from "../services/authService";
import { translations } from "@/i18n/locales";
// import { DocumentRequest, CertificateOfOriginData } from '../types';
// import { getAllRequests } from '../services/requestService';
// import { useAuth } from '../contexts/AuthContext';

// Translation hook
const useTranslations = () => {
  const t = (key: string, language: "en" | "fr" | "ar" = "en") => {
    return (translations[language] as any)?.comesa?.[key] || key;
  };

  const getTranslation = (key: string, fallback: string = "") => {
    // Try to get from staffPages.comisaPrint first, then comesa
    const staffTranslation =
      (translations as any)?.ar?.staffPages?.comisaPrint?.[key] ||
      (translations as any)?.en?.staffPages?.comisaPrint?.[key];

    if (staffTranslation) {
      return staffTranslation;
    }

    // Fallback to comesa translations
    return (
      (translations as any)?.ar?.comesa?.[key] ||
      (translations as any)?.en?.comesa?.[key] ||
      fallback ||
      key
    );
  };

  return { t, getTranslation };
};

// interface COMESACertificateProps {
//   documentRequests?: DocumentRequest[];
//   requestId?: string;
// }

// Main component
const COMESACertificate: React.FC = () => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { t, getTranslation } = useTranslations();
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

  // Parsed extra data
  const [parsedExtraData, setParsedExtraData] = useState<any>(null);

  // Data fetching states (commented out for now)
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  // const [requests, setRequests] = useState<DocumentRequest[]>([]);
  // const [currentRequest, setCurrentRequest] = useState<DocumentRequest | null>(null);

  // Generate QR code
  const generateQrCode = useCallback(() => {
    try {
      const newUniqueId =
        "COMESA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

      // Use qr_identifier from certificateData if available, otherwise use id
      const qrIdentifier = certificateData?.qr_identifier || id;

      // Generate public URL for the certificate using qr_identifier
      const publicUrl = `${window.location.origin}/#/public/certificate/comisa/${qrIdentifier}`;

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
      toast.error(
        getTranslation(
          "qrError",
          "An error occurred while generating the QR code. The entered data may be too long. Please try again with shorter data."
        )
      );
    }
  }, [id, certificateData?.qr_identifier]);

  // Certificate data fetching effect
  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!id) {
        console.log(
          getTranslation("noId", "No certificate ID provided in URL")
        );
        return;
      }

      const certificateId = parseInt(id, 10);
      if (isNaN(certificateId)) {
        console.error(
          getTranslation("invalidId", "Invalid certificate ID:"),
          id
        );
        setCertificateError(
          getTranslation("invalidId", "Invalid certificate ID")
        );
        return;
      }

      // Check authentication first
      const user = getCurrentUser();
      if (!user || !user.accessToken) {
        console.error(
          getTranslation("notAuthenticated", "User not authenticated")
        );
        setCertificateError(
          getTranslation(
            "authRequired",
            "Authentication required to access certificate data"
          )
        );
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
        setCertificateData(data);

        // Parse extra data if available
        if (data.extra) {
          try {
            const parsedExtra = JSON.parse(data.extra);
            console.log("Parsed extra data:", parsedExtra);
            setParsedExtraData(parsedExtra);
          } catch (error) {
            console.error("Error parsing extra data:", error);
            setParsedExtraData(null);
          }
        } else {
          setParsedExtraData(null);
        }

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
            getTranslation(
              "sessionExpired",
              "Session expired, please log in again"
            )
          );
        } else {
          // Redirect to 404 page for all other errors (NOT_FOUND, Internal server error, etc.)
          navigate("/404");
          return;
        }
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificateData();
  }, [id]);

  // Generate QR code when component loads
  useEffect(() => {
    if (id) {
      generateQrCode();
    }
  }, [id, generateQrCode]);

  // Handle logo upload
  const handleLogoUpload =
    (setLogo: React.Dispatch<React.SetStateAction<string | null>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogo(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  const handlePrint = useReactToPrint({
    documentTitle: "COMESA Certificate",
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
          padding:0px 0 0 0 !important;
        }
        
        /* Force Arabic text to right side in print */
        .print-container-inner-table-span-arabic {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: bidi-override !important;
          margin-right: 20px !important;
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


        .print-container-inner-left-logo{
        transform: translateX(25px) translateY(25px) scale(1.35) !important;
        }

        .print-container-inner-right-logo{
        transform: translateX(15px) translateY(25px) scale(1.35) !important;
        }
        
        /* Certificate title styling for print only */
        .certificate-title-english {
          font-size: 18px !important;
          font-weight: 900 !important;
          letter-spacing: 0.5px !important;
        }
        
        .certificate-title-arabic {
          font-size: 24px !important;
          font-weight: 900 !important;
        }
        
        /* Footer positioning for print */
        .print-container-inner-table-span-arabic-footer {
          transform: translateX(120px) !important;
          direction: ltr !important;
          text-align: left !important;
        }
        
        .print-container-inner-table-span-arabic-footer span {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: bidi-override !important;
        }
        
        /* Fix numbered items direction for print */
        .numbered-item {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: bidi-override !important;
        }
        
        /* Ensure numbers stay at the beginning of the line in print */
        .numbered-item b {
          direction: ltr !important;
          unicode-bidi: bidi-override !important;
        }
      }
    }
  `,
  });

  // Print/PDF functionality

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

  // Certificate data loading/error display
  if (certificateLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
          backgroundColor: "#f5f5f5",
        }}
      >
        {getTranslation("loading", "Loading certificate data...")}
      </div>
    );
  }

  if (certificateError) {
    const isAuthError =
      certificateError.includes(getTranslation("login", "Login")) ||
      certificateError.includes(
        getTranslation("sessionExpired", "Session expired")
      );

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ fontSize: "18px", color: "#d32f2f" }}>
          {getTranslation("error", "Error loading certificate data")}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          {certificateError}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {getTranslation("retry", "Retry")}
          </button>
          {isAuthError && (
            <button
              onClick={() => (window.location.href = "/login")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {getTranslation("login", "Login")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="print-container"
      style={{
        direction: "rtl",
        fontFamily: "'Times New Roman', serif !important",
        margin: 0,
        padding: "20px",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Certificate data is now available in certificateData state */}
      {/* You can access it like: certificateData?.title, certificateData?.client_name, etc. */}
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
          {getTranslation("print", "Print / Print")}
        </button>

        {/* API Response Button */}
        {/* <button
          onClick={() => {
            setApiResponseData(certificateData);
            setShowApiResponseModal(true);
          }}
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

      {/* Hidden file inputs for logo upload */}
      <input
        type="file"
        id="left-logo-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleLogoUpload(setLeftLogo)}
      />
      <input
        type="file"
        id="right-logo-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleLogoUpload(setRightLogo)}
      />

      {/* Certificate container */}
      <div
        className="print-container"
        style={{
          width: "595px" /* عرض A4 بالبكسل @ 72 DPI */,
          height: "842px" /* طول A4 بالبكسل @ 72 DPI */,
          margin: "10px auto",
          backgroundColor: "white",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          boxSizing: "border-box",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div ref={certificateRef} className="print-container-inner">
          {/* Left Logo - COMESA */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "50px",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              className="print-container-inner-left-logo"
              src="/images/icons/logo_comesa@2x.png"
              alt="COMESA Logo"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Right Logo - Free Trade */}
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "50px",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              className="print-container-inner-right-logo"
              src="/images/free-trade-print/free-trade-logo-left.png"
              alt="Free Trade Logo"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* QR Code */}
          <div
            className="print-container-inner-qr"
            style={{
              position: "absolute",
              top: "203px",
              left: "335px",
              width: "36px",
              height: "36px",
              // backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "6px",
              color: "#666",
            }}
          >
            {qrData && (
              <QRCodeSVG
                value={qrData}
                size={60}
                level="M"
                includeMargin={false}
              />
            )}
          </div>

          {/* Header */}
          <div
            style={{
              position: "absolute",
              top: "70px",
              left: "0",
              width: "100%",
              textAlign: "center",
              color: "#000",
              fontWeight: "bold",
              fontFamily: "'Times New Roman', serif !important",
            }}
          >
            <div className="certificate-title-english" style={{ fontSize: "14px", direction: "ltr" }}>
              CERTIFICATE OF ORIGIN
            </div>
            <div className="certificate-title-arabic" style={{ fontSize: "18px", marginTop: "5px" }}>
              شهادة المنشأ
            </div>
          </div>

          {/* Serial Number */}
          <div className="print-container-inner-table">
            <div
              className="serial-number-section"
              style={{
                position: "absolute",
                top: "118px",
                left: "336px",
                fontSize: "9px",
                direction: "ltr",
                color: "#000",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              S/N:{" "}
              <span
                style={{
                  // borderBottom: "1px dotted #000",
                  padding: "0px",
                  minWidth: "150px",
                  display: "inline-block",
                }}
              >
                {certificateData?.serial_number}
              </span>
            </div>

            {/* Box 1 - Exporter */}
            <div
              style={{
                position: "absolute",
                top: "129px",
                left: "40px",
                width: "283px",
                height: "67px",
                border: "1px solid #000",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                1. Exporter (name & office address)
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Exportateur (nom et adresse commerciale)
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                المصدّر (الإسم وعنوان العمل)
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.exporter_name}
              </div>
            </div>

            {/* Box Ref - Reference Number */}
            <div
              className="reference-number-section"
              style={{
                position: "absolute",
                top: "129px",
                left: "323px",
                width: "232px",
                height: "67px",
                border: "1px solid #000",
                borderLeft: "none",
                borderBottom: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                justifyContent: "space-between",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <div
                style={{
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  Ref. No.{" "}
                  <span
                    style={{
                      borderBottom: "1px dotted #000",
                      padding: "0 1px",
                      minWidth: "80px",
                      display: "inline-block",
                      textAlign: "left",
                    }}
                  >
                    {certificateData?.identity_number}
                  </span>
                </span>
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  No. de ref{" "}
                  <span
                    style={{
                      borderBottom: "1px dotted #000",
                      padding: "0 1px",
                      minWidth: "80px",
                      display: "inline-block",
                    }}
                  >
                    {certificateData?.identity_number}
                  </span>
                </span>
              </div>
              <span
                className="print-container-inner-table-span-arabic"
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                الرقم المرجعي:{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.identity_number}
                </span>
              </span>
            </div>

            {/* Box 2 - Consignee */}
            <div
              style={{
                position: "absolute",
                top: "196px",
                left: "40px",
                width: "283px",
                height: "64px",
                border: "1px solid #000",
                borderTop: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                2. Consignee (name & office address)
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Destinataire (nom et adresse commerciale)
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                المرسل إليه (الإسم وعنوان العمل)
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.title || "_________________"}
              </div>
            </div>

            {/* Box Title - COMESA Title */}
            <div
              style={{
                position: "absolute",
                top: "196px",
                left: "323px",
                width: "232px",
                height: "131px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                textAlign: "center",
                justifyContent: "flex-end",
                lineHeight: "1.2",
                paddingBottom: "5px",
                borderBottom: "1px solid black",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <div style={{ marginTop: "30px" }}>
                <span>COMMON MARKET FOR EASTERN AND SOUTHERN AFRICA</span>
                <span>MARCHE COMMUN DE L'AFRIQUE ORIENTALE ET AUSTRALE</span>
                <strong
                  style={{
                    fontSize: "9px",
                    display: "block",
                    marginTop: "10px",
                  }}
                >
                  CERTIFICATE OF ORIGIN
                </strong>
                <strong style={{ fontSize: "9px", display: "block" }}>
                  CERTIFICAT D'ORIGINE
                </strong>
                <strong style={{ fontSize: "11px", display: "block" }}>
                  شهادة منشأ
                </strong>
              </div>
            </div>

            {/* Box 3 - Origin Country */}
            <div
              style={{
                position: "absolute",
                top: "260px",
                left: "40px",
                width: "283px",
                height: "67px",
                border: "1px solid #000",
                borderTop: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                3. Country, group of countries in which the products are
                originating from
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Pay ou groupe de pays dont les produits sont originaires
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                الدولة أو مجموعة الدول التي تعتبر منشأ البضاعة
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.country_producer || "_________________"}
              </div>
            </div>

            {/* Box 4 - Transport Details */}
            <div
              style={{
                position: "absolute",
                top: "327px",
                left: "40px",
                width: "283px",
                height: "71px",
                border: "1px solid #000",
                borderTop: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                4. Particulars of transport
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Renseignements concernant le transport
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                معلومات متعلقة بالنقل
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {parsedExtraData?.transport_details ||
                  certificateData?.description ||
                  "_________________"}
              </div>
            </div>

            {/* Box 5 - Official Use */}
            <div
              style={{
                position: "absolute",
                top: "327px",
                left: "323px",
                width: "232px",
                height: "71px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                5. For official use - Reserve a l'usage officiel
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                للإستعمال الرسمي
              </span>
              {certificateData?.for_official_use}
            </div>

            {/* Box 6 - Goods Description */}
            <div
              style={{
                position: "absolute",
                top: "398px",
                left: "40px",
                width: "191px",
                height: "173px",
                border: "1px solid #000",
                borderTop: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                6. Marks and numbers; number and kind of package, description of
                goods;
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Marques et numero; types d'emballages; designation des
                marchandises
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                  marginTop: ".45rem",
                }}
              >
                علامات وأرقام؛ وعدد ونوع الطرود؛ وتوصيف السلع ؛
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.signs || certificateData?.description}
              </div>
            </div>

            {/* Box 7 - Customs Tariff */}
            <div
              style={{
                position: "absolute",
                top: "398px",
                left: "231px",
                width: "92px",
                height: "173px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                7. Customs Tariff No.
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Tariff douanier No.
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                  marginTop: "1.9rem",
                }}
              >
                رقم التعريفة الجمركية
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.activity_type}
              </div>
            </div>

            {/* Box 8 - Origin Criterion */}
            <div
              style={{
                position: "absolute",
                top: "398px",
                left: "323px",
                width: "79px",
                height: "173px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                8. Origin criterion (see overleaf)
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Critere d'origine (voir au verso)
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                  marginTop: ".5rem",
                }}
              >
                معيار المنشأ (راجع الصفحة التالية)
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.standard_of_origin}
              </div>
            </div>

            {/* Box 9 - Gross Weight */}
            <div
              style={{
                position: "absolute",
                top: "398px",
                left: "402px",
                width: "90px",
                height: "173px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                9. Gross weight or other quantity;
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                Pois brut ou autre quantite;
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                  marginTop: ".5rem",
                }}
              >
                إجمالي الوزن أو العدد
              </span>
              {/* <div
            style={{
              flexGrow: 1,
              marginTop: "5px",
              padding: "2px",
              fontSize: "9px",
              fontWeight: "bold",
            }}
          >
            {certificateData?.weight ||
              certificateData?.quantity ||
              "_________________"}
          </div> */}
              <div>
                {/* <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
              {t("totalWeightAndQuantity", "ar")}:
            </div> */}
                <div>
                  <strong>{t("grossWeightWithoutNumbering", "ar")}:</strong>{" "}
                  {certificateData?.weight || "--"} كغ
                </div>
                <div>
                  <strong>{t("netWeight", "ar")}:</strong>{" "}
                  {certificateData?.net_weight || "--"} كغ
                </div>
                <div>
                  <strong>{t("quantity", "ar")}:</strong>{" "}
                  {certificateData?.quantity || "- - -"}
                </div>
                <div>
                  <strong>{t("value", "ar")}:</strong>{" "}
                  {certificateData?.item_cost || "- - -"} دينار ليبي
                </div>
              </div>
            </div>

            {/* Box 10 - Invoice Number */}
            <div
              style={{
                position: "absolute",
                top: "398px",
                left: "492px",
                width: "63px",
                height: "173px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                10. Invoice No.
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                No. de Facture,
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                  marginTop: "2rem",
                }}
              >
                رقم الفاتورة
              </span>
              <div
                style={{
                  flexGrow: 1,
                  marginTop: "5px",
                  padding: "2px",
                  fontSize: "9px",
                  fontWeight: "bold",
                }}
              >
                {certificateData?.invoice_number || "_________________"}
              </div>
            </div>
            {/* Box 11 - Declaration */}
            <div
              style={{
                position: "absolute",
                top: "571px",
                left: "40px",
                width: "283px",
                height: "200px",
                border: "1px solid #000",
                borderTop: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                <b>11. DECLARATION BY EXPORTER/PRODUCER/SUPPLIER*</b>
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                <b>DECLARATION DE L'EXPORTATEUR/PRODUCTEUR/FOURNISSEUR*</b>
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                <b>إقرار المصدر/المنتج/المورد*</b>
              </span>

              <span
                style={{
                  textAlign: "left",
                  direction: "ltr",
                  fontSize: "7px",
                  marginTop: "10px",
                }}
              >
                I, the undersigned, hereby declare that the above details and
                statements are correct, that the goods are produced in{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>
              <span
                style={{ textAlign: "left", direction: "ltr", fontSize: "7px" }}
              >
                Je soussigne, declare que les elements et declarations ci-dessus
                sont corrects, et que les marchandises sont produits en{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "8px",
                }}
              >
                أقر أنا الموقع أدناه بأن البيانات والإفادات أعلاه صحيحة وأن
                السلع كلها منتجة في{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>

              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  width: "95%",
                }}
              >
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  Place, date, signature of declarant
                </span>
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  Lieu, date et signature du declarant
                </span>
                <span style={{ textAlign: "right", direction: "rtl" }}>
                  المكان والتاريخ وتوقيع مقدَم الإقرار
                </span>
                <div
                  style={{
                    height: "20px",
                    textAlign: "left",
                    direction: "ltr",
                    marginTop: "5px",
                    // borderBottom: "1px solid #000",
                  }}
                ></div>
              </div>
            </div>

            {/* Box 12 - Certificate */}
            <div
              style={{
                position: "absolute",
                top: "571px",
                left: "323px",
                width: "232px",
                height: "200px",
                border: "1px solid #000",
                borderTop: "none",
                borderLeft: "none",
                padding: "5px",
                fontSize: "8px",
                color: "#000",
                lineHeight: "1.4",
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                fontFamily: "'Times New Roman', serif !important",
              }}
            >
              <span className="numbered-item" style={{ textAlign: "left", direction: "ltr" }}>
                <b>12. CERTIFICATE OF ORIGIN</b>
              </span>
              <span style={{ textAlign: "left", direction: "ltr" }}>
                <b>CERTIFICAT D'ORIGINE</b>
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "9px",
                }}
              >
                <b>شهادة المنشأ</b>
              </span>

              <span
                style={{
                  textAlign: "left",
                  direction: "ltr",
                  fontSize: "7px",
                  marginTop: "10px",
                }}
              >
                It is hereby certified that the above-mentioned goods are of
                origin{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>
              <span
                style={{
                  textAlign: "left",
                  direction: "ltr",
                  fontSize: "7px",
                  marginTop: "10px",
                }}
              >
                Nous certifions que les marchandises susmentionnées sont
                d'origine{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>
              <span
                style={{
                  textAlign: "right",
                  direction: "rtl",
                  fontSize: "8px",
                  marginTop: "10px",
                }}
              >
                نشهد بأن السلع المذكورة أعلاه ذات منشأ في{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 1px",
                    minWidth: "80px",
                    display: "inline-block",
                  }}
                >
                  {certificateData?.country_producer}
                </span>
              </span>

              <div
                style={{
                  position: "absolute",
                  bottom: "30px",
                  right: "5px",

                  width: "95%",
                  textAlign: "left",
                }}
              >
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  Certificate of customs or other Designated authority
                </span>
                <br />
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  Certificat des douanes ou autres autorites designees
                </span>
                <br />
                <div style={{ textAlign: "right", direction: "rtl" }}>
                  <span style={{ textAlign: "right", direction: "rtl" }}>
                    شهادة مصلحة الجمارك أو الجهة المختصة المخولة
                  </span>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  textAlign: "left",
                  width: "95%",
                }}
              >
                <span style={{ textAlign: "left", direction: "ltr" }}>
                  STAMP - SCEAU -{" "}
                  <span
                    style={{
                      display: "inline",
                      textAlign: "right",
                      direction: "rtl",
                    }}
                  >
                    الختم
                  </span>
                </span>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div
            className="print-container-inner-table-span-arabic-footer"
            style={{
              position: "absolute",
              bottom: "35px",
              left: "106px",
              fontSize: "9px",
              direction: "ltr",
              fontWeight: "bold",
              fontFamily: "'Times New Roman', serif !important",
            }}
          >
            *Please delete the description not applicable – Biffer les mentions
            inutiles – <span dir="rtl">فضلا ً احذف ما لا ينطبق من الوصف</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COMESACertificate;
