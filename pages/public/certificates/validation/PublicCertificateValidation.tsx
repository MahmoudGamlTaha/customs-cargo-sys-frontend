import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OfficialLogoIcon } from "../../../../components/icons";
import { useLanguage } from "../../../../contexts/LanguageContext";

import { searchCertificateBySerial, CertificateValidationData } from "../../../../services/public/publicCertificateService";

const PublicCertificateValidation: React.FC = () => {
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
    { code: 'ar', name: 'العربية', flag: 'AR' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto scroll to results when they appear
  useEffect(() => {
    if (result) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [result]);

  const handleSearch = async () => {
    if (!certificateNumber.trim()) {
      alert(t('certificateValidation.enterCertificateNumber'));
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const certificateData = await searchCertificateBySerial(certificateNumber.trim());

      setResult({
        found: true,
        certificateNumber: certificateNumber.trim(),
        message: t('certificateValidation.foundSuccess'),
        certificateData: certificateData
      });
    } catch (error) {
      console.error('Error validating certificate:', error);
      setResult({
        found: false,
        certificateNumber: certificateNumber.trim(),
        message: t('certificateValidation.notFound')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (!result?.certificateData?.qr_identifier) {
      alert(t('certificateValidation.featureNotImplemented'));
      return;
    }

    // Determine the certificate type based on request_type_id
    const requestTypeId = result.certificateData.request_type_id;

    if (requestTypeId === 1) {
      // COMESA Certificate
      navigate(`/public/certificate/comisa/${result.certificateData.qr_identifier}`);
    } else if (requestTypeId === 2) {
      // Free Trade Certificate
      navigate(`/public/certificate/free-trade/${result.certificateData.qr_identifier}`);
    } else {
      // Unknown type - show error
      alert(t('certificateValidation.featureNotImplemented'));
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setCertificateNumber("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        <OfficialLogoIcon
          className="h-16 sm:h-20 mx-auto dark:invert"
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "20px",
            margin: "0 auto 20px auto",
          }}
        />

        {/* Back to Login Button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            backgroundColor: "#EA580C",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
            fontFamily: "'Cairo', sans-serif",
            zIndex: 1000,
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#C2410C"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#EA580C"}
        >
          → {t('certificateValidation.backToLogin')}
        </button>

        {/* Language Toggle Button */}
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              backgroundColor: "white",
              color: "#EA580C",
              border: "2px solid #EA580C",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              transition: "all 0.3s",
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#EA580C";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#EA580C";
            }}
          >
            <span style={{ fontSize: "16px", marginRight: "8px" }}>{currentLanguage?.flag}</span>
            <span style={{ marginRight: "8px" }}>{currentLanguage?.name}</span>
            <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLanguageDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                marginTop: "5px",
                width: "200px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e0e0e0",
                zIndex: 1001,
              }}
            >
              {languages?.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as 'ar' | 'en' | 'fr');
                    setIsLanguageDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: language === lang.code ? "#f0f8ff" : "transparent",
                    color: language === lang.code ? "#EA580C" : "#333",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "'Cairo', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "16px", marginRight: "10px" }}>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#EA580C",
            margin: "0 0 10px 0",
          }}
        >
          {t('certificateValidation.title')}
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#666",
            margin: "0",
            maxWidth: "600px",
            lineHeight: "1.5",
          }}
        >
          {t('certificateValidation.description')}
        </p>
      </div>

      {/* Search Form */}
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "10px",
            }}
          >
            {t('certificateValidation.certificateNumber')}
          </label>
          <input
            type="text"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            placeholder={t('certificateValidation.certificateNumberPlaceholder')}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.3s",
              textAlign: "center",
              fontFamily: "'Cairo', sans-serif",
            }}
            onFocus={(e) => e.target.style.borderColor = "#EA580C"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            fontWeight: "bold",
            backgroundColor: loading ? "#ccc" : "#EA580C",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s",
            fontFamily: "'Cairo', sans-serif",
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#C2410C";
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#EA580C";
          }}
        >
          {loading ? t('certificateValidation.searching') : t('certificateValidation.searchButton')}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          {result.found ? (
            // Success Result
            <div>
              <div
                style={{
                  fontSize: "48px",
                  color: "#4caf50",
                  marginBottom: "20px",
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#4caf50",
                  margin: "0 0 10px 0",
                }}
              >
                {t('certificateValidation.certificateFound')}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  margin: "0 0 20px 0",
                }}
              >                
                {t('certificateValidation.certificateNumberLabel')}: <strong style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>{result.certificateNumber}</strong>
              </p>

              {result.certificateData && (
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    margin: "15px 0",
                    // textAlign: "left",
                  }}
                >
                  <p style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#333" }}>
                    <strong>{t('certificateValidation.titleLabel')}:</strong> {result.certificateData.title}
                  </p>
                  <p style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#333" }}>
                    <strong>{t('certificateValidation.statusLabel')}:</strong> {t(`certificateValidation.status.${result.certificateData.status}`)}
                  </p>
                  <p style={{ fontSize: "14px", margin: "0 0 8px 0", color: "#333" }}>
                    <strong>{t('certificateValidation.createdDateLabel')}:</strong> {new Date(result.certificateData.created_at).toLocaleDateString('ar-SA')} ({t('certificateValidation.gregorianDate')}) / {new Date(result.certificateData.created_at).toLocaleDateString('ar-SA-u-ca-islamic')} ({t('certificateValidation.hijriDate')})
                  </p>
                  {result.certificateData.description && (
                    <p style={{ fontSize: "14px", margin: "0", color: "#333" }}>
                      <strong>{t('certificateValidation.descriptionLabel')}:</strong> {result.certificateData.description}
                    </p>
                  )}
                </div>
              )}

              <p
                style={{
                  fontSize: "14px",
                  color: "#333",
                  margin: "0 0 30px 0",
                  lineHeight: "1.5",
                }}
              >
                {result.message}
              </p>
              <button
                onClick={handleViewCertificate}
                style={{
                  padding: "15px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  fontFamily: "'Cairo', sans-serif",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4caf50"}
              >
                {t('certificateValidation.viewCertificate')}
              </button>
            </div>
          ) : (
            // Not Found Result
            <div>
              <div
                style={{
                  fontSize: "48px",
                  color: "#f44336",
                  marginBottom: "20px",
                }}
              >
                ✗
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f44336",
                  margin: "0 0 10px 0",
                }}
              >
                {t('certificateValidation.certificateNotFound')}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  margin: "0 0 20px 0",
                }}
              >
                {t('certificateValidation.certificateNumberLabel')}: <strong style={{ direction: "ltr", unicodeBidi: "bidi-override"}}>{result.certificateNumber}</strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#333",
                  margin: "0 0 30px 0",
                  lineHeight: "1.5",
                }}
              >
                {result.message}
              </p>
              <button
                onClick={handleTryAgain}
                style={{
                  padding: "15px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "#EA580C",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  fontFamily: "'Cairo', sans-serif",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#C2410C"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#EA580C"}
              >
                {t('certificateValidation.tryAgain')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help Section - Removed for production */}
    </div>
  );
};

export default PublicCertificateValidation;
