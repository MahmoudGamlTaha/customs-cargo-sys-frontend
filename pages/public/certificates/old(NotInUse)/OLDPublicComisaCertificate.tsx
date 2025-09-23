import React, { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useNavigate } from "react-router-dom";

import { translations } from "@/i18n/locales";
import {
  getPublicCertificateByQrId,
  PublicCertificateData,
} from "@/services/public/publicCertificateService";

// import { DocumentRequest, CertificateOfOriginData } from '../types';
// import { getAllRequests } from '../services/requestService';
// import { useAuth } from '../contexts/AuthContext';

// Translation hook
const useTranslations = () => {
  const t = (key: string, language: "en" | "fr" | "ar" = "en") => {
    return (translations[language] as any)?.comesa?.[key] || key;
  };

  return { t };
};

// interface COMESACertificateProps {
//   documentRequests?: DocumentRequest[];
//   requestId?: string;
// }

// Main component
const OLDPublicComisaCertificate: React.FC = () => {
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
    useState<PublicCertificateData | null>(null);
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
        "An error occurred while generating the QR code. The entered data may be too long. Please try again with shorter data."
      );
    }
  }, [id, certificateData?.qr_identifier]);

  // Certificate data fetching effect
  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!id) {
        console.log("No certificate QR identifier provided in URL");
        setCertificateError("Certificate identifier not found");
        return;
      }

      setCertificateLoading(true);
      setCertificateError(null);

      try {
        console.log("Fetching public certificate data for QR ID:", id);

        // Validate QR ID format
        if (!id || id.trim() === "") {
          throw new Error("معرف الشهادة غير صحيح");
        }

        const data = await getPublicCertificateByQrId(id);

        console.log("Certificate data fetched successfully:", data);

        // Validate that we received valid certificate data
        if (!data || !data.id) {
          throw new Error("بيانات الشهادة غير صحيحة أو فارغة");
        }

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

        // Handle different types of errors
        if (error instanceof Error) {
          if (
            error.message.includes("404") ||
            error.message.includes("Not Found")
          ) {
            setCertificateError("الشهادة غير موجودة أو تم حذفها");
          } else if (
            error.message.includes("403") ||
            error.message.includes("Forbidden")
          ) {
            setCertificateError("ليس لديك صلاحية للوصول إلى هذه الشهادة");
          } else if (
            error.message.includes("500") ||
            error.message.includes("Internal Server Error")
          ) {
            setCertificateError("خطأ في الخادم، يرجى المحاولة لاحقاً");
          } else {
            setCertificateError(
              `خطأ في تحميل بيانات الشهادة: ${error.message}`
            );
          }
        } else {
          setCertificateError("خطأ غير معروف في تحميل بيانات الشهادة");
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
        padding: 0.2cm !important;
        box-sizing: border-box !important;
        transform: scale(0.95) !important;
        transform-origin: top center !important;
        min-height: 29.7cm !important;
      }
      table {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
      }
      td, th {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: auto !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
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
          transform: scale(0.85) !important;
        }
      }
    }
  `,
  });
  // Data fetching functionality (commented out for now)
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (documentRequests) {
  //       // Use provided data
  //       setRequests(documentRequests);
  //       const targetId = requestId || id;
  //       if (targetId) {
  //         const request = documentRequests.find(req => req.id === targetId);
  //         setCurrentRequest(request || null);
  //       }
  //       return;
  //     }

  //     // Fetch from API
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       if (!user || !user.accessToken) {
  //         setError('Authentication required. Please log in.');
  //         setLoading(false);
  //         return;
  //       }

  //       const response = await getAllRequests(user.accessToken);

  //       if (response.success && response.data?.requests) {
  //         const fetchedRequests = response.data.requests as DocumentRequest[];
  //         setRequests(fetchedRequests);

  //         const targetId = requestId || id;
  //         if (targetId) {
  //           const request = fetchedRequests.find(req => req.id === targetId);
  //           setCurrentRequest(request || null);
  //         }
  //       } else {
  //         setError(response.message || 'Failed to fetch requests');
  //       }
  //     } catch (err) {
  //       console.error('Error fetching requests:', err);
  //       setError('An error occurred while fetching requests');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [documentRequests, requestId, id]);

  // Update form data when current request changes (commented out for now)
  // useEffect(() => {
  //   if (currentRequest && currentRequest.certificateData) {
  //     let certData: CertificateOfOriginData | undefined;

  //     if (typeof currentRequest.certificateData === 'string') {
  //       try {
  //         certData = JSON.parse(currentRequest.certificateData);
  //       } catch (e) {
  //         console.error("Failed to parse certificateData", e);
  //       }
  //     } else {
  //       certData = currentRequest.certificateData;
  //     }

  //     if (certData) {
  //       setFormData(prev => ({
  //         ...prev,
  //         serial_no: currentRequest.serialNumber || '',
  //         ref_no_en: currentRequest.id || '',
  //         exporter: '', // Will be filled manually
  //         consignee: certData.consignee || '',
  //         origin_country: '', // Will be filled manually
  //         transport: certData.transportDetails || '',
  //         goods_description: certData.goodsDescription || '',
  //         invoice_no: certData.invoiceNumber || '',
  //         customs_tariff: '', // Will be filled manually
  //         gross_weight: certData.grossWeight || '',
  //         production_country_en: '', // Will be filled manually
  //         production_country_fr: '', // Will be filled manually
  //         production_country_ar: '', // Will be filled manually
  //       }));
  //     }
  //   }
  // }, [currentRequest]);

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

  // Loading and error states (commented out for now)
  // if (loading) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       height: '100vh',
  //       backgroundColor: '#f5f5f5'
  //     }}>
  //       <div style={{ textAlign: 'center' }}>
  //         <div style={{ fontSize: '18px', marginBottom: '10px' }}>جاري التحميل...</div>
  //         <div style={{ fontSize: '14px', color: '#666' }}>Loading...</div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       height: '100vh',
  //       backgroundColor: '#f5f5f5'
  //     }}>
  //       <div style={{ textAlign: 'center', color: '#d32f2f' }}>
  //         <div style={{ fontSize: '18px', marginBottom: '10px' }}>خطأ في تحميل البيانات</div>
  //         <div style={{ fontSize: '14px' }}>{error}</div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (requestId || id) {
  //   if (!currentRequest) {
  //     return (
  //       <div style={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: '100vh',
  //         backgroundColor: '#f5f5f5'
  //       }}>
  //         <div style={{ textAlign: 'center', color: '#d32f2f' }}>
  //           <div style={{ fontSize: '18px', marginBottom: '10px' }}>لم يتم العثور على الطلب</div>
  //           <div style={{ fontSize: '14px' }}>Request not found</div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

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
        جاري تحميل بيانات الشهادة...
      </div>
    );
  }

  if (certificateError) {
    const isAuthError =
      certificateError.includes("تسجيل الدخول") ||
      certificateError.includes("انتهت صلاحية");

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
          خطأ في تحميل بيانات الشهادة
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
            إعادة المحاولة
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
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
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
        {/* <button
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
        </button> */}

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
        ref={certificateRef}
        className="print-container"
        style={{
          width: "21cm",
          minHeight: "29.7cm",
          margin: "10px auto",
          border: "2px solid #000",
          padding: "0.5cm",
          backgroundColor: "white",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
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
              "/images/free-trade-print/free-trade-logo-right.png"
            }
            alt="Watermark"
            style={{
              width: "8cm",
              height: "10cm",
              objectFit: "contain",
            }}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {/* Header Row */}
            <tr>
              <td
                colSpan={3}
                style={{
                  borderBottom: "2px solid black",
                  paddingBottom: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div>
                    <img
                      src={
                        leftLogo ||
                        "/images/free-trade-print/free-trade-logo-left.png"
                      }
                      alt="Left Logo"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: "14pt",
                        fontWeight: "bold",
                        display: "block",
                      }}
                    >
                      {t("certificateTitle", "en")}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: "14pt",
                        fontWeight: "bold",
                        display: "block",
                      }}
                    >
                      {t("certificateTitle", "ar")}
                    </span>
                  </div>
                  <div>
                    <img
                      src={
                        rightLogo ||
                        "/images/free-trade-print/free-trade-logo-right.png"
                      }
                      alt="Right Logo"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Reference Row */}
            <tr>
              <td colSpan={3} style={{ padding: "3px 0", fontSize: "8pt" }}>
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          textAlign: "right",
                          direction: "rtl",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        {t("referenceNumber", "ar")}:
                        <span
                          style={{
                            borderBottom: "1px dotted #888",
                            padding: "0 1px",
                            minWidth: "50px",
                            display: "inline-block",
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        >
                          {certificateData?.identity_number || "________"}
                        </span>
                      </td>
                      <td style={{ textAlign: "left", direction: "ltr" }}>
                        {t("serialNumber", "en")}:
                        <span
                          style={{
                            borderBottom: "1px dotted #888",
                            padding: "0 1px",
                            minWidth: "50px",
                            display: "inline-block",
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        >
                          {certificateData?.serial_number || "________"}
                        </span>
                        <br />
                        {t("referenceNumber", "en")}:
                        <span
                          style={{
                            borderBottom: "1px dotted #888",
                            padding: "0 1px",
                            minWidth: "50px",
                            display: "inline-block",
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        >
                          {certificateData?.identity_number || "________"}
                        </span>
                        <br />
                        {t("referenceNumber", "fr")}:
                        <span
                          style={{
                            borderBottom: "1px dotted #888",
                            padding: "0 1px",
                            minWidth: "50px",
                            display: "inline-block",
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        >
                          {certificateData?.identity_number || "________"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Main Content Grid */}

            <tr>
              <td colSpan={3}>
                {/* QR COde here, on the left side always */}

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "50%",
                          borderRight: "none",
                          height: "10px",
                        }}
                      >
                        <div
                          style={{
                            padding: "2px",
                            // height: "100%",
                            textAlign: "center",
                            direction: "ltr",
                            // height: "px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            height: "165px",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              paddingTop: "40px",
                            }}
                          >
                            <div
                              style={{
                                border: "1px solid black",
                                height: "125px",
                              }}
                            >
                              {t("comesaFullName", "en")}
                              <br />
                              {t("comesaFullName", "fr")}
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "center",
                                  direction: "rtl",
                                  fontFamily: "'Cairo', sans-serif",
                                  fontSize: "7pt",
                                  fontWeight: "bold",
                                }}
                              >
                                {certificateData?.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          // width: "50%",
                          borderLeft: "none",
                          // backgroundColor: "#f0f0f0",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "170px",
                          // padding:"50px"
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              paddingTop: "10px",
                              border: "1px solid black",
                              width: "100%",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("exporter", "en")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("exporter", "fr")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "right",
                                direction: "rtl",
                                fontFamily: "'Cairo', sans-serif",
                                fontSize: "7pt",
                              }}
                            >
                              {t("exporter", "ar")}
                            </span>
                            <div
                              style={{
                                display: "block",
                                width: "100%",
                                height: "100%",
                                minHeight: "50px",
                                border: "none",
                                color: "#000",
                                padding: "2px",
                                fontWeight: "bold",
                              }}
                            >
                              <h6 style={{ fontSize: "9pt" }}>
                                {certificateData?.exporter_name ||
                                  certificateData?.exporter_name ||
                                  "_________________"}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan={2} style={{ verticalAlign: "top" }}>
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "100%",
                            textAlign: "center",
                            direction: "ltr",
                            paddingTop: "10px",
                            minHeight: "285px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "16pt",
                          }}
                        >
                          {t("certificateTitle", "en")}
                          <br />
                          {t("certificateTitle", "fr")}
                          <br />
                          <span
                            style={{
                              display: "block",
                              textAlign: "center",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                              // fontSize: "7pt",
                            }}
                          >
                            {t("certificateTitle", "ar")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "100%",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("consignee", "en")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("consignee", "fr")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          >
                            {t("consignee", "ar")}
                          </span>
                          <div
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              minHeight: "50px",
                              border: "none",
                              color: "#000",
                              padding: "2px",
                              fontWeight: "bold",
                            }}
                          >
                            <div
                              style={{ marginBottom: "10px", fontSize: "8pt" }}
                            >
                              <strong>المرسل إليه:</strong>{" "}
                              {certificateData?.title || "_________________"}
                            </div>
                            {/* <div style={{ fontSize: "12pt" }}>
                              <strong>اسم المصدر:</strong>{" "}
                              {certificateData?.exporter_name ||
                                "_________________"}

                            </div> */}
                            <div style={{ marginTop: "5px", fontSize: "8pt" }}>
                              <strong>رقم الهوية:</strong>{" "}
                              {certificateData?.identity_number ||
                                "_________________"}
                            </div>
                            <div style={{ marginTop: "5px", fontSize: "8pt" }}>
                              <strong>رقم الهاتف:</strong>{" "}
                              {certificateData?.mobile_number ||
                                "_________________"}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "100%",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("originCountry", "en")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("originCountry", "fr")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          >
                            {t("originCountryLabel", "ar")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              fontStyle: "italic",
                            }}
                          >
                            {t("originCountryLabel", "fr")}
                          </span>
                          <div
                            style={{
                              display: "block",
                              width: "100%",
                              // height: "100%",
                              // minHeight: "50px",
                              border: "none",
                              color: "#000",
                              padding: "2px",
                              fontWeight: "bold",
                              fontSize: "7pt",
                            }}
                          >
                            {certificateData?.country_producer || "- - -"}
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            minHeight: "100px",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("officialUse", "en")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("officialUse", "fr")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          >
                            {t("officialUseLabel", "ar")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              fontStyle: "italic",
                            }}
                          >
                            {t("officialUseLabel", "fr")}
                          </span>
                          <div
                            style={{
                              display: "block",
                              width: "100%",
                              // height: "100%",
                              // minHeight: "50px",
                              border: "none",
                              color: "#000",
                              padding: "2px",
                              fontWeight: "bold",
                              marginTop: "2px",
                              fontSize: "7pt",
                            }}
                          >
                            {certificateData?.for_official_use || "- - -"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "100%",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("transportDetails", "en")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                            }}
                          >
                            {t("transportDetails", "fr")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                            }}
                          >
                            {t("transportDetailsLabel", "ar")}
                          </span>
                          <span
                            style={{
                              display: "block",
                              textAlign: "left",
                              direction: "ltr",
                              fontFamily: "'Cairo', sans-serif",
                              fontSize: "7pt",
                              fontStyle: "italic",
                            }}
                          >
                            {t("transportDetailsLabel", "fr")}
                          </span>
                          <div
                            style={{
                              display: "block",
                              width: "100%",
                              // height: "100%",
                              // minHeight: "50px",
                              border: "none",
                              color: "#000",
                              padding: "2px",
                              fontWeight: "bold",
                              fontSize: "7pt",
                            }}
                          >
                            {parsedExtraData?.transport_details ||
                              certificateData?.description ||
                              "- - -"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* <br />
                <br /> */}

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "-1px",
                    marginBottom: "5px",
                  }}
                >
                  <tbody>
                    <tr>
                      <th
                        style={{
                          width: "35%",
                          border: "1px solid black",
                          padding: "4px",
                          fontSize: "7pt",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("goodsDescription", "en")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("goodsDescription", "fr")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            direction: "rtl",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                          }}
                        >
                          {t("goodsDescription", "ar")}
                        </span>
                      </th>
                      <th
                        style={{
                          width: "13%",
                          border: "1px solid black",
                          padding: "4px",
                          fontSize: "7pt",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("customsTariff", "en")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("customsTariff", "fr")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            direction: "rtl",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                          }}
                        >
                          {t("customsTariff", "ar")}
                        </span>
                      </th>
                      <th
                        style={{
                          width: "15%",
                          border: "1px solid black",
                          padding: "4px",
                          fontSize: "7pt",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("originCriterion", "en")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("originCriterion", "fr")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            direction: "rtl",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                          }}
                        >
                          {t("originCriterion", "ar")}
                        </span>
                      </th>
                      <th
                        style={{
                          width: "22%",
                          border: "1px solid black",
                          padding: "4px",
                          fontSize: "7pt",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("grossWeight", "en")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("grossWeight", "fr")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            direction: "rtl",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                          }}
                        >
                          {t("grossWeight", "ar")}
                        </span>
                      </th>
                      <th
                        style={{
                          width: "15%",
                          border: "1px solid black",
                          padding: "4px",
                          fontSize: "7pt",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("invoiceNumber", "en")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "left",
                            direction: "ltr",
                          }}
                        >
                          {t("invoiceNumber", "fr")}
                        </span>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            direction: "rtl",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                          }}
                        >
                          {t("invoiceNumber", "ar")}
                        </span>
                      </th>
                    </tr>
                    <tr>
                      <td
                        style={{
                          height: "120px",
                          border: "1px solid black",
                          padding: "4px",
                          verticalAlign: "top",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        {certificateData?.signs ? (
                          <div
                            style={{ marginBottom: "10px", fontSize: "5pt" }}
                          >
                            <strong>{t("signsAndNumbers", "ar")}:</strong>
                            <br />
                            {certificateData.signs}
                          </div>
                        ) : (
                          "- - -"
                        )}
                        {/* {certificateData?.description && (
                          <div style={{ fontSize: "5pt" }}>
                            <strong>وصف البضائع:</strong>
                            <br />
                            {certificateData.description}
                          </div>
                        )} */}
                        {/* {!certificateData?.signs &&
                          !certificateData?.description &&
                          "- - -"} */}
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "4px",
                          verticalAlign: "top",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        <div style={{ fontSize: "5pt" }}>
                          <strong>{t("customsTariffLabel", "ar")}:</strong>
                          <br />
                          {certificateData?.activity_type || "- - -"}
                        </div>
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "4px",
                          verticalAlign: "top",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        <div style={{ fontSize: "5pt" }}>
                          <strong>{t("originCriterionLabel", "ar")}:</strong>
                          <br />
                          {certificateData?.standard_of_origin || "- - -"}
                        </div>
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "4px",
                          verticalAlign: "top",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        <div style={{ fontSize: "5pt" }}>
                          <div
                            style={{ marginBottom: "5px", fontWeight: "bold" }}
                          >
                            {t("totalWeightAndQuantity", "ar")}:
                          </div>
                          <div>
                            <strong>{t("grossWeight", "ar")}:</strong>{" "}
                            {certificateData?.weight || "- - -"} كغ
                          </div>
                          <div>
                            <strong>{t("netWeight", "ar")}:</strong>{" "}
                            {certificateData?.net_weight || "- - -"} كغ
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
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "4px",
                          verticalAlign: "top",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        <div style={{ fontSize: "5pt" }}>
                          <div>
                            <strong>{t("invoiceNumberLabel", "ar")}:</strong>{" "}
                            {certificateData?.invoice_number || "- - -"}
                          </div>
                          <div style={{ marginTop: "5px" }}>
                            <strong>{t("invoiceDate", "ar")}:</strong>{" "}
                            {certificateData?.invoice_date
                              ? new Date(
                                  certificateData.invoice_date
                                ).toLocaleDateString("ar-SA")
                              : "- - -"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Declarations Row */}
            <tr>
              <td colSpan={3}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "2px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "50%",
                          padding: 0,
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "180px",
                            margin: "-1px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "5pt" }}>
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("certificateTitle2", "en")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("certificateTitle2", "fr")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "right",
                                direction: "rtl",
                                fontFamily: "'Cairo', sans-serif",
                              }}
                            >
                              {t("certificateTitle2", "ar")}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "7pt",
                              margin: "3px 0",
                              direction: "ltr",
                            }}
                          >
                            {t("certificateText", "en")}
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                            <br />
                            Nous certifions que les marchandises susmentionnees
                            sont d'origine
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: "7pt",
                              margin: "3px 0",
                              fontWeight: "bold",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            نشهد بأن السلع المذكورة بهذا المستند هي من أصل
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                          </p>
                          <div style={{ marginTop: "auto" }}>
                            <p style={{ fontSize: "8pt", margin: "5px 0" }}>
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "left",
                                  direction: "ltr",
                                }}
                              >
                                {t("stamp", "en")} - {t("stamp", "fr")} -{" "}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "right",
                                  direction: "rtl",
                                  fontFamily: "'Cairo', sans-serif",
                                }}
                              >
                                {t("stamp", "ar")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          width: "50%",
                          padding: 0,
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          style={{
                            border: "1px solid black",
                            padding: "2px",
                            height: "180px",
                            margin: "-1px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "5pt" }}>
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("declarationTitle", "en")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "left",
                                direction: "ltr",
                              }}
                            >
                              {t("declarationTitle", "fr")}
                            </span>
                            <span
                              style={{
                                display: "block",
                                textAlign: "right",
                                direction: "rtl",
                                fontFamily: "'Cairo', sans-serif",
                              }}
                            >
                              {t("declarationTitle", "ar")}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "7pt",
                              margin: "3px 0",
                              direction: "ltr",
                            }}
                          >
                            {t("declarationText", "en")}
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                            <br />
                            Je soussigne, declare que les elements et
                            declarations ci-dessus sont corrects, et que les
                            marchandises sont produits en
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: "7pt",
                              margin: "3px 0",
                              fontWeight: "bold",
                              textAlign: "right",
                              direction: "rtl",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            نقرأنا الموقع أدناه بأن البيانات والإقرارات أعلاه
                            صحيحة وأن السلع كلها منتجة في
                            <span
                              style={{
                                borderBottom: "1px dotted #888",
                                padding: "0 1px",
                                minWidth: "50px",
                                display: "inline-block",
                                color: "#000",
                                fontWeight: "bold",
                              }}
                            >
                              {certificateData?.country_producer || "________"}
                            </span>
                          </p>
                          <div
                            style={{
                              marginTop: "auto",
                            }}
                          >
                            <p style={{ fontSize: "8pt", margin: "5px 0" }}>
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "left",
                                  direction: "ltr",
                                }}
                              >
                                {t("signature", "en")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "left",
                                  direction: "ltr",
                                }}
                              >
                                {t("signature", "fr")}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  textAlign: "right",
                                  direction: "rtl",
                                  fontFamily: "'Cairo', sans-serif",
                                }}
                              >
                                {t("signature", "ar")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Row */}
        {/* <br />
        <br /> */}

        {/* QR Code section hidden */}
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
              width: "800px",
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
    </div>
  );
};

export default OLDPublicComisaCertificate;
