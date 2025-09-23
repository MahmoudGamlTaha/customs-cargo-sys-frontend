import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle";
import BackButton from "../../components/BackButton";
import { getPublicCertificateByQrId, PublicCertificateData } from "../../services/public/publicCertificateService";

const PublicFreeTradeCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  // Certificate data states
  const [certificateData, setCertificateData] = useState<PublicCertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  // Parsed extra data
  const [parsedExtraData, setParsedExtraData] = useState<any>(null);

  // Disable all user interactions except for buttons
  useEffect(() => {
    console.log('Setting up certificate protection...');
    
    // Add CSS to disable text selection only
    const style = document.createElement('style');
    style.id = 'certificate-protection';
    style.textContent = `
      body * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const existingStyle = document.getElementById('certificate-protection');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

console.log("parsedExtraData",parsedExtraData);

  // Load certificate data
  useEffect(() => {
    if (!id) {
      console.log("No certificate QR identifier provided in URL");
      setCertificateError(t('freeTradeCertificate.invalidCertificateId'));
      return;
    }

    setCertificateLoading(true);
    setCertificateError(null);

    const fetchCertificateData = async () => {
      try {
        const data = await getPublicCertificateByQrId(id);
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
      } catch (error) {
        console.error("Error fetching certificate:", error);
        setCertificateError(error instanceof Error ? error.message : t('freeTradeCertificate.loadError'));
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificateData();
  }, [id]);

  // Disable all user interactions except language button and back button
  useEffect(() => {
    const disableAllInteractions = (event: Event) => {
      // Allow language button and back button interactions
      const target = event.target as HTMLElement;
      
      // Debug logging
      console.log('Event target:', target);
      console.log('Target tagName:', target?.tagName);
      console.log('Target className:', target?.className);
      console.log('Target has data-back-button:', target?.hasAttribute('data-back-button'));
      console.log('Target closest back-button:', target?.closest('.back-button'));
      
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

  // Loading state
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
{t('freeTradeCertificate.loadingCertificate')}
      </div>
    );
  }

  // Error state
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
          {t('freeTradeCertificate.loadError')}
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
{t('freeTradeCertificate.retry')}
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
{t('freeTradeCertificate.login')}
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
        // pointerEvents: "none", // Disable all interactions on the main div
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
{t('freeTradeCertificate.certificateTitle')}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6c757d",
              margin: "0",
            }}
          >
            Free Trade Certificate / Certificat de Commerce Libre
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
{t('freeTradeCertificate.basicInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.referenceNumber')}:</strong> {certificateData?.identity_number || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.serialNumber')}:</strong> {certificateData?.serial_number || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.certificateTitleField')}:</strong> {certificateData?.title || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.createdDate')}:</strong>{" "}
                {certificateData?.created_at
                  ? new Date(certificateData.created_at).toLocaleDateString("ar-SA")
                  : t('freeTradeCertificate.notSpecified')}
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
{t('freeTradeCertificate.companyInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.identityNumber')}:</strong> {certificateData?.identity_number || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.phoneNumber')}:</strong> {certificateData?.mobile_number || t('freeTradeCertificate.notSpecified')}
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
{t('freeTradeCertificate.invoiceInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.invoiceNumber')}:</strong> {certificateData?.invoice_number || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.invoiceDate')}:</strong>{" "}
                {certificateData?.invoice_date
                  ? new Date(certificateData.invoice_date).toLocaleDateString("ar-SA")
                  : t('freeTradeCertificate.notSpecified')}
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
{t('freeTradeCertificate.productInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.grossWeight')}:</strong> {certificateData?.weight || t('freeTradeCertificate.notSpecified')} {t('freeTradeCertificate.kg')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.netWeight')}:</strong> {certificateData?.net_weight || t('freeTradeCertificate.notSpecified')} {t('freeTradeCertificate.kg')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.quantity')}:</strong> {parsedExtraData?.quantity || certificateData?.quantity || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.cost')}:</strong> {parsedExtraData?.item_cost  || t('freeTradeCertificate.notSpecified')} {t('freeTradeCertificate.libyanDinar')}
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
{t('freeTradeCertificate.originInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.countryOfOrigin')}:</strong> {parsedExtraData?.goods_origin || certificateData?.country_producer || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.originStandard')}:</strong> {certificateData?.standard_of_origin || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.officialUse')}:</strong> {certificateData?.for_official_use || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.originDeclaration')}:</strong> {parsedExtraData?.origin_declaration || t('freeTradeCertificate.notSpecified')}
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
{t('freeTradeCertificate.descriptionDetails')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.marksAndNumbers')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.signs || t('freeTradeCertificate.notSpecified')}
                </div>
              </div>
              <div>
                <strong>{t('freeTradeCertificate.transportInfo')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {parsedExtraData?.transport_details || certificateData?.transfer_detail || t('freeTradeCertificate.notSpecified')}
                </div>
              </div>
              {/* <div>
                <strong>اسم المصدر:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.exporter_name || "غير محدد"}
                </div>
              </div> */}
              <div>
                <strong>{t('freeTradeCertificate.activityType')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {certificateData?.activity_type || t('freeTradeCertificate.notSpecified')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Financial Details */}
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
{t('freeTradeCertificate.financialInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.totalValue')}:</strong> {parsedExtraData?.total_value || certificateData?.item_cost || t('freeTradeCertificate.notSpecified')} {t('freeTradeCertificate.libyanDinar')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.totalValueText')}:</strong>
                <div style={{ marginTop: "5px", fontSize: "14px", lineHeight: "1.5" }}>
                  {parsedExtraData?.total_value_text || t('freeTradeCertificate.notSpecified')}
                </div>
              </div>
              <div>
                <strong>{t('freeTradeCertificate.valueAddedPercentage')}:</strong> {parsedExtraData?.value_added_percentage || t('freeTradeCertificate.notSpecified')}{t('freeTradeCertificate.percentage')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.foreignRevenueQuantity')}:</strong> {parsedExtraData?.foreign_revenue_quantity || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.foreignRevenueValue')}:</strong> {parsedExtraData?.foreign_revenue_value || t('freeTradeCertificate.notSpecified')} {t('freeTradeCertificate.libyanDinar')}
              </div>
            </div>
          </div>

          {/* Certificate Details */}
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
{t('freeTradeCertificate.additionalInfo')}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong>{t('freeTradeCertificate.issuePlace')}:</strong> {parsedExtraData?.issue_place || t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.issueDate')}:</strong>{" "}
                {parsedExtraData?.issue_date
                  ? new Date(parsedExtraData.issue_date).toLocaleDateString("ar-SA")
                  : t('freeTradeCertificate.notSpecified')}
              </div>
              <div>
                <strong>{t('freeTradeCertificate.certifyingAuthority')}:</strong> {parsedExtraData?.certifying_authority || t('freeTradeCertificate.notSpecified')}
              </div>
              {/* <div>
                <strong>الكمية:</strong> {parsedExtraData?.quantity || certificateData?.quantity || "غير محدد"}
              </div> */}
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
{t('freeTradeCertificate.reviewOnly')}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#adb5bd",
              margin: "5px 0 0 0",
            }}
          >
            Data displayed for review purposes only - Not printable or editable
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicFreeTradeCertificate;