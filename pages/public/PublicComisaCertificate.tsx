import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle";
import BackButton from "../../components/BackButton";

import {
  getPublicCertificateByQrId,
  PublicCertificateData,
} from "../../services/public/publicCertificateService";

// import { DocumentRequest, CertificateOfOriginData } from '../types';
// import { getAllRequests } from '../services/requestService';
// import { useAuth } from '../contexts/AuthContext';


// interface COMESACertificateProps {
//   documentRequests?: DocumentRequest[];
//   requestId?: string;
// }

// Main component
const PublicComisaCertificate: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Certificate data states
  const [certificateData, setCertificateData] =
    useState<PublicCertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  // Parsed extra data
  const [parsedExtraData, setParsedExtraData] = useState<any>(null);


  // Data fetching states (commented out for now)
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  // const [requests, setRequests] = useState<DocumentRequest[]>([]);
  // const [currentRequest, setCurrentRequest] = useState<DocumentRequest | null>(null);


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
          throw new Error(t('comesaCertificate.invalidCertificateId'));
        }

        const data = await getPublicCertificateByQrId(id);

        console.log("Certificate data fetched successfully:", data);

        // Validate that we received valid certificate data
        if (!data || !data.id) {
          throw new Error(t('comesaCertificate.invalidCertificateData'));
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
            setCertificateError(t('comesaCertificate.certificateNotFound'));
          } else if (
            error.message.includes("403") ||
            error.message.includes("Forbidden")
          ) {
            setCertificateError(t('comesaCertificate.accessDenied'));
          } else if (
            error.message.includes("500") ||
            error.message.includes("Internal Server Error")
          ) {
            setCertificateError(t('comesaCertificate.serverError'));
          } else {
            setCertificateError(
              `${t('comesaCertificate.loadError')}: ${error.message}`
            );
          }
        } else {
          setCertificateError(t('comesaCertificate.unknownError'));
        }
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificateData();
  }, [id]);


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

  // Disable all user interactions except language button
  useEffect(() => {
    const disableAllInteractions = (event: Event) => {
      // Allow language button interactions
      const target = event.target as HTMLElement;
      
      if (target && (
        target.closest('[data-language-button]') || 
        target.closest('[data-language-dropdown]') ||
        target.closest('.language-toggle') ||
        target.classList.contains('language-toggle') ||
        target.closest('[data-back-button]') ||
        target.hasAttribute('data-back-button') ||
        target.closest('.back-button') ||
        target.classList.contains('back-button') ||
        target.closest('button[data-back-button]') ||
        target.tagName === 'BUTTON' && target.hasAttribute('data-back-button') ||
        target.closest('svg') && target.closest('.back-button') ||
        target.closest('span') && target.closest('.back-button') ||
        // Additional checks for BackButton
        target.closest('button') && target.closest('button').classList.contains('back-button') ||
        target.parentElement?.classList.contains('back-button') ||
        target.parentElement?.hasAttribute('data-back-button') ||
        target.closest('div') && target.closest('div').style.zIndex === '1000' ||
        target.style.zIndex === '1000'
      )) {
        console.log('Button interaction allowed:', target.tagName, target.className);
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
    };

    // Disable all possible user interactions
    const events = [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
      'keydown', 'keyup', 'keypress', 'contextmenu', 'selectstart', 'dragstart',
      'touchstart', 'touchend', 'touchmove', 'touchcancel'
    ];

    events.forEach(eventType => {
      document.addEventListener(eventType, disableAllInteractions, { capture: true });
    });

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, disableAllInteractions, { capture: true });
      });
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
{t('comesaCertificate.loadingCertificate')}
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
          {t('comesaCertificate.loadError')}
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
{t('comesaCertificate.retry')}
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
{t('comesaCertificate.login')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        direction: language === 'ar' ? "rtl" : "ltr",
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#f8f9fa",
        margin: 0,
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      {/* Language Toggle Button */}
      <LanguageToggle />
      
      {/* Back Button */}
      <div 
        style={{ position: 'relative', zIndex: 1000 }}
        data-back-button="true"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Back button clicked!');
        }}
      >
        <BackButton targetPath="/login" />
      </div>
      {/* Data Display Container */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
            paddingBottom: "20px",
            borderBottom: "2px solid #e9ecef",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2c3e50",
              margin: "0 0 10px 0",
            }}
          >
{t('comesaCertificate.certificateTitle')}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6c757d",
              margin: "0",
            }}
          >
{t('comesaCertificate.certificateTitle')}
          </p>
        </div>

        {/* Certificate Information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Basic Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.basicInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.referenceNumber')}:</strong> {certificateData?.identity_number || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.serialNumber')}:</strong> {certificateData?.serial_number || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.certificateTitleField')}:</strong> {certificateData?.title || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.createdDate')}:</strong>{" "}
                {certificateData?.created_at
                  ? new Date(certificateData.created_at).toLocaleDateString("ar-SA")
                  : t('comesaCertificate.notSpecified')}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.companyInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.identityNumber')}:</strong> {certificateData?.identity_number || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.phoneNumber')}:</strong> {certificateData?.mobile_number || t('comesaCertificate.notSpecified')}
              </div>
            </div>
          </div>
        </div>

        {/* Trade Information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Invoice Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.invoiceInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.invoiceNumber')}:</strong> {certificateData?.invoice_number || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.invoiceDate')}:</strong>{" "}
                {certificateData?.invoice_date
                  ? new Date(certificateData.invoice_date).toLocaleDateString("ar-SA")
                  : t('comesaCertificate.notSpecified')}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.productInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.grossWeight')}:</strong> {certificateData?.weight || t('comesaCertificate.notSpecified')} {t('comesaCertificate.kg')}
              </div>
              <div>
                <strong>{t('comesaCertificate.netWeight')}:</strong> {certificateData?.net_weight || t('comesaCertificate.notSpecified')} {t('comesaCertificate.kg')}
              </div>
              <div>
                <strong>{t('comesaCertificate.quantity')}:</strong> {certificateData?.quantity || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.cost')}:</strong> {certificateData?.item_cost || t('comesaCertificate.notSpecified')} {t('comesaCertificate.libyanDinar')}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Origin Information */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.originInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.countryOfOrigin')}:</strong> {certificateData?.country_producer || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.originStandard')}:</strong> {certificateData?.standard_of_origin || t('comesaCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('comesaCertificate.officialUse')}:</strong> {certificateData?.for_official_use || t('comesaCertificate.notSpecified')}
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2c3e50",
                margin: "0 0 15px 0",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "10px",
              }}
            >
{t('comesaCertificate.descriptionDetails')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('comesaCertificate.marksAndNumbers')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.signs || t('comesaCertificate.notSpecified')}
                </div>
              </div>
              <div>
                <strong>{t('comesaCertificate.transportInfo')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {parsedExtraData?.transport_details || certificateData?.transfer_detail || t('comesaCertificate.notSpecified')}
                </div>
              </div>
              <div>
                <strong>{t('comesaCertificate.exporterName')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.exporter_name || t('comesaCertificate.notSpecified')}
                </div>
              </div>
              <div>
                <strong>{t('comesaCertificate.activityType')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.activity_type || t('comesaCertificate.notSpecified')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Information */}
        <div
          style={{
            backgroundColor: "#e9ecef",
            padding: "20px",
            borderRadius: "6px",
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#6c757d",
              margin: "0",
            }}
          >
{t('comesaCertificate.reviewOnly')}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#adb5bd",
              margin: "5px 0 0 0",
            }}
          >
{t('comesaCertificate.reviewOnlyEn')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicComisaCertificate;
