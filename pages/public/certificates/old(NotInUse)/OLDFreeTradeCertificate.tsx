import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getPublicCertificateByQrId, PublicCertificateData } from "@/services/public/publicCertificateService";
// import { getPublicCertificateByQrId, PublicCertificateData } from "../../services/public/publicCertificateService";

const OLDFreeTradeCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Certificate data states
  const [certificateData, setCertificateData] = useState<PublicCertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  // QR Code data
  const [qrData, setQrData] = useState<string>("");

  // Parse extra data function
  const parseFreeTradeExtraData = () => {
    if (!certificateData?.extra) return null;
    try {
      return JSON.parse(certificateData.extra);
    } catch (error) {
      console.error("Error parsing extra data:", error);
      return null;
    }
  };

  // Parse foreign cost items function
  const parseForeignCostItems = () => {
    if (!certificateData?.foreign_items_cost) return [];
    try {
      return JSON.parse(certificateData.foreign_items_cost);
    } catch (error) {
      console.error("Error parsing foreign cost items:", error);
      return [];
    }
  };

  // Calculate foreign items totals
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
    return { totalQuantity, totalValue };
  };

  // Load certificate data
  useEffect(() => {
    if (!id) {
      console.log("No certificate QR identifier provided in URL");
      setCertificateError("Certificate identifier not found");
      return;
    }

    setCertificateLoading(true);
    setCertificateError(null);

    const fetchCertificateData = async () => {
      try {
        const data = await getPublicCertificateByQrId(id);
        console.log("Certificate data fetched successfully:", data);
        setCertificateData(data);
        
        // Generate QR code data
        const qrDataString = `${window.location.origin}/public/certificate/${id}`;
        setQrData(qrDataString);
      } catch (error) {
        console.error("Error fetching certificate:", error);
        setCertificateError(error instanceof Error ? error.message : "Failed to load certificate");
      } finally {
        setCertificateLoading(false);
      }
    };

    fetchCertificateData();
  }, [id]);

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
        Loading certificate...
      </div>
    );
  }

  // Error state - 404 style
  if (certificateError) {
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
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        <div style={{ fontSize: "72px", color: "#d32f2f", fontWeight: "bold" }}>
          404
        </div>
        <div style={{ fontSize: "24px", color: "#333", fontWeight: "bold" }}>
          Certificate Not Found
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#666",
            textAlign: "center",
            maxWidth: "400px",
            lineHeight: "1.5",
          }}
        >
          {certificateError}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1565c0"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1976d2"}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: "'Times New Roman', serif",
        backgroundColor: "#f5f5f5",
        margin: 0,
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      {/* Certificate container */}
      <div
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
            minHeight: "29.7cm",
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
              src="/images/free-trade-print/free-trade-logo-right.png"
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
                alignItems: "center",
                marginBottom: "3px",
                borderBottom: "1px solid black",
                paddingBottom: "2px",
              }}
            >
              <div>
                <img
                  src="/images/free-trade-print/free-trade-logo-right.png"
                  alt="Right Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ textAlign: "center", flexGrow: 1 }}>
                <div
                  style={{
                    fontSize: "12pt",
                    fontWeight: "bold",
                    marginBottom: "2px",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  دولة ليبيـــــــا
                </div>
                <div
                  style={{
                    fontSize: "14pt",
                    fontWeight: "bold",
                    marginBottom: "2px",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  شهــــــادة منشــــــــأ
                </div>
                <div
                  style={{
                    fontSize: "8pt",
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
                  src="/images/free-trade-print/free-trade-logo-left.png"
                  alt="Left Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            {/* Company Information */}
            <div style={{ marginBottom: "2px" }}>
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
                          رقم الفاتورة: {certificateData?.invoice_number || "_________________"}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          التاريخ: {certificateData?.invoice_date ? new Date(certificateData.invoice_date).toLocaleDateString("ar-SA") : "_________________"}
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
                          ? `${parseFreeTradeExtraData().total_value} دينار ليبي`
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
                fontFamily: "'Cairo', sans-serif",
                direction: "rtl",
              }}
            >
              <div style={{ marginBottom: "2px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid black",
                    fontSize: "6pt",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "30%",
                          border: "1px solid black",
                          padding: "1px",
                          fontSize: "6pt",
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
                          fontSize: "6pt",
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
                          fontSize: "6pt",
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
                          fontSize: "6pt",
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
                          fontSize: "6pt",
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
                          fontSize: "4pt",
                        }}
                      ></th>
                      <th
                        style={{
                          border: "1px solid black",
                          borderBottom: "none",
                          padding: "1px",
                          fontSize: "4pt",
                        }}
                      ></th>
                      <th
                        style={{
                          border: "1px solid black",
                          padding: "1px",
                          fontSize: "4pt",
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
                          fontSize: "4pt",
                        }}
                      ></th>
                      <th
                        style={{
                          border: "1px solid black",
                          padding: "1px",
                          fontSize: "4pt",
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
                              height: "30px",
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
                            border: "1px solid #ccc",
                            padding: "1px",
                            minHeight: "12px",
                            backgroundColor: "#f9f9f9",
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: "7pt",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                          }}
                        >
                          {parseFreeTradeExtraData()?.total_value
                            ? `${parseFreeTradeExtraData().total_value} دينار ليبي`
                            : "_________________________________"}
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
              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "9pt",
                  fontWeight: "bold",
                  marginBottom: "3px",
                }}
              >
                صادرة عن مصلحة الجمارك الليبية /
                {certificateData?.serial_number || "......................"}
                .. رقم الشهادة:
                {certificateData?.serial_number || "......................"}
              </div>

              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "9pt",
                  fontWeight: "bold",
                  marginBottom: "3px",
                }}
              >
                القيمة الإجمالية رقما وكتابة: {parseFreeTradeExtraData()?.total_value_text || "....................................................................................................................................."}
              </div>
            </div>
          </div>

          {/* Page 2 Content - Merged */}
          <div style={{ position: "relative", zIndex: 2, marginTop: "1px" }}>
            {/* Cost Elements Table */}
            <div style={{ marginBottom: "2px" }}>
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
                  marginBottom: "3px",
                  fontSize: "6pt",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        width: "60%",
                        border: "1px solid black",
                        padding: "2px",
                        fontSize: "6pt",
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
                        fontSize: "6pt",
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
                        fontSize: "6pt",
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
                          padding: "0px 2px",
                          height: "12px",
                          textAlign: "flex-start",
                          fontWeight: "bold",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "7pt",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          {index + 1}- {item.description || ""}
                        </div>
                      </td>
                      <td
                        style={{
                          border: "1px solid black",
                          padding: "0px",
                          textAlign: "center",
                        }}
                      >
                        {item.quantity || "________"}
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "0px" }}
                      >
                        {item.value || "________"}
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
                          padding: "0px 2px",
                          height: "12px",
                          textAlign: "flex-start",
                          fontWeight: "bold",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "7pt",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          {parseForeignCostItems()?.length + index + 1}-
                        </div>
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "0px" }}
                      >
                        ________
                      </td>
                      <td
                        style={{ border: "1px solid black", padding: "0px" }}
                      >
                        ________
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "0px 2px",
                        height: "12px",
                        textAlign: "flex-start",
                        fontWeight: "bold",
                        fontFamily: "'Cairo', sans-serif",
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
                      {calculateForeignItemsTotals().totalQuantity ||
                        "________"}
                    </td>
                    <td style={{ border: "1px solid black", padding: "0px" }}>
                      {calculateForeignItemsTotals().totalValue || "________"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "0px 2px",
                        height: "12px",
                        textAlign: "flex-start",
                        fontWeight: "bold",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      التكلفة النهائية للإنتاج
                    </td>
                    <td style={{ border: "1px solid black", padding: "0px" }}>
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        padding: "0px",
                        textAlign: "center",
                      }}
                    >
                      {calculateForeignItemsTotals().totalValue || "________"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Declaration Section */}
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
                منشأ.{" "}
                <span
                  style={{
                    borderBottom: "1px dotted #000",
                    padding: "0 50px",
                  }}
                >
                  {parseFreeTradeExtraData()?.origin_declaration ||
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
                    {parseFreeTradeExtraData()?.value_added_percentage || "_________________"}
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
                    {parseFreeTradeExtraData()?.issue_place || "_________________"}
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
                    }}
                  >
                    بتاريخ{" "}
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "10pt",
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
                        {parseFreeTradeExtraData()?.issue_date ? new Date(parseFreeTradeExtraData().issue_date).toLocaleDateString("ar-SA") : ""}
                      </div>
                      <div
                        style={{
                          fontSize: "10pt",
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
                {parseFreeTradeExtraData()?.certifying_authority || "_________________"}
                بأن السلع الموضح بياناتها أعلاه هي من{" "}
                {parseFreeTradeExtraData()?.goods_origin || "_________________"}
                منشأ:{" "}
                {parseFreeTradeExtraData()?.goods_origin || "_________________"}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                  }}
                >
                  حرر في{" "}
                  {parseFreeTradeExtraData()?.issue_place || "_________________"}
                </div>
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "10pt",
                  }}
                >
                  بتاريخ{" "}
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "10pt",
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
                      {parseFreeTradeExtraData()?.issue_date ? new Date(parseFreeTradeExtraData().issue_date).toLocaleDateString("ar-SA") : ""}
                    </div>
                    <div
                      style={{
                        fontSize: "10pt",
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
                padding: "2px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
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

              <div style={{ textAlign: "center", marginBottom: "15px" }}>
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

              {/* QR Code and Certificate Number */}
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
                    {certificateData?.serial_number ||
                      certificateData?.qr_identifier ||
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
                      fontSize: "4pt",
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
      </div>
    </div>
  );
};

export default OLDFreeTradeCertificate;