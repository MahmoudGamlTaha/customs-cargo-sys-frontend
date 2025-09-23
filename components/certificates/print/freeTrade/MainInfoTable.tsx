import React from "react";

interface MainInfoTableProps {
  certificateData: any;
  editableFields: any;
  parseFreeTradeExtraData: () => any;
}

const MainInfoTable: React.FC<MainInfoTableProps> = ({
  certificateData,
  editableFields,
  parseFreeTradeExtraData,
}) => {
  return (
    <div style={{ marginBottom: "5px" }}>
      <table
        cellSpacing={0}
        cellPadding={0}
        style={{
          width: "100%",
          margin: "10px 0",
          border: "1px solid #000000",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr style={{ height: "30pt" }}>
            <td
              colSpan={2}
              style={{
                width: "50%",
                borderRight: "1px solid #000000",
                borderBottom: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
              }}
            >
              <p dir="rtl" style={{ margin: 0, fontSize: "9.5pt" }}>
                <span
                  style={{
                    fontFamily: '"Khalid Art bold"',
                    fontWeight: 700,
                  }}
                >
                  المصدر وعنوانه
                </span>{" "}
                /
              </p>
              <div
                style={{
                  padding: "1px",
                  minHeight: "15px",
                  marginTop: "2px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {certificateData?.exporter_name ||
                  "_________________________________"}
              </div>
            </td>
            <td
              colSpan={4}
              style={{
                width: "50%",
                borderLeft: "1px solid #000000",
                borderRight: "1px solid #000000",
                borderBottom: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  lineHeight: "116%",
                  fontSize: "9.5pt",
                }}
              >
                <span
                  style={{
                    fontFamily: '"Khalid Art bold"',
                    fontWeight: 700,
                  }}
                >
                  الشركة المنتجة&nbsp;
                </span>
                <span dir="ltr">/&nbsp;</span>
              </p>
              <div
                style={{
                  padding: "1px",
                  minHeight: "15px",
                  marginTop: "2px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {/* New Input here */}
                {certificateData?.company_name || "_________________________________"}
              </div>
            </td>
          </tr>
          <tr style={{ height: "30pt" }}>
            <td
              colSpan={2}
              style={{
                width: "50%",
                borderTop: "1px solid #000000",
                borderRight: "1px solid #000000",
                borderBottom: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  lineHeight: "116%",
                  fontSize: "9.5pt",
                }}
              >
                <span
                  style={{
                    fontFamily: '"Khalid Art bold"',
                    fontWeight: 700,
                  }}
                >
                  المستورد وعنوانه&nbsp;
                </span>
                /
              </p>
              <div
                style={{
                  padding: "2px",
                  minHeight: "20px",
                  marginTop: "5px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {certificateData?.title || "_________________________________"}
              </div>
            </td>
            <td
              colSpan={4}
              style={{
                width: "50%",
                borderTop: "1px solid #000000",
                borderLeft: "1px solid #000000",
                borderRight: "1px solid #000000",
                borderBottom: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  lineHeight: "116%",
                  fontSize: "9.5pt",
                }}
              >
                <span
                  style={{
                    fontFamily: '"Khalid Art bold"',
                    fontWeight: 700,
                  }}
                >
                  رقم وتاريخ الفاتورة&nbsp;
                </span>
                /
              </p>
              <div
                style={{
                  padding: "2px",
                  minHeight: "20px",
                  marginTop: "5px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {editableFields.invoice_number &&
                editableFields.invoice_date_gregorian
                  ? `رقم: ${editableFields.invoice_number} - تاريخ: ${editableFields.invoice_date_gregorian}`
                  : certificateData?.invoice_number
                  ? `رقم: ${certificateData.invoice_number}`
                  : "_________________________________"}
              </div>
            </td>
          </tr>
          <tr style={{ height: "10pt" }}>
            <td
              style={{
                width: "30%",
                border: "1px solid #000000",
                padding: "2px 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
                textAlign: "center",
                lineHeight: "116%",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                عدد ونوع وأرقام وعلامات الطرود
              </span>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: "2px 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
                textAlign: "center",
                lineHeight: "116%",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                نوع البضاعة
              </span>
            </td>
            <td
              colSpan={2}
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: "2px 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
                textAlign: "center",
                lineHeight: "116%",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                الوزن
              </span>
            </td>
            <td
              style={{
                width: "15%",
                border: "1px solid #000000",
                padding: "2px 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
                textAlign: "center",
                lineHeight: "116%",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                الكمية
              </span>
            </td>
            <td
              style={{
                width: "15%",
                border: "1px solid #000000",
                padding: "2px 4.65pt",
                verticalAlign: "top",
                backgroundColor: "#ffffff",
                textAlign: "center",
                lineHeight: "116%",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                القيمة بالعملة المحلية
              </span>
            </td>
          </tr>
          <tr style={{ height: "15pt" }}>
            <td
              rowSpan={2}
              style={{
                width: "30%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "30px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {certificateData?.signs || "________________"}
              </div>
            </td>
            <td
              rowSpan={2}
              style={{
                width: "20%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "30px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "right",
                }}
              >
                {certificateData?.activity_type || "________________"}
              </div>
            </td>
            <td
              style={{
                width: "10%",
                border: "1px solid #000000",
                padding: "2px",
                textAlign: "center",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                القائم
              </span>
            </td>
            <td
              style={{
                width: "10%",
                border: "1px solid #000000",
                padding: "2px",
                textAlign: "center",
                fontSize: "9.5pt",
              }}
            >
              <span
                style={{
                  fontFamily: '"Khalid Art bold"',
                  fontWeight: 700,
                }}
              >
                الصافي
              </span>
            </td>
            <td
              rowSpan={2}
              style={{
                width: "15%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "30px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "center",
                }}
              >
                {parseFreeTradeExtraData()?.quantity ||
                  certificateData?.quantity ||
                  "________________"}
              </div>
            </td>
            <td
              rowSpan={2}
              style={{
                width: "15%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "30px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "center",
                }}
              >
                {parseFreeTradeExtraData()?.total_value
                  ? `${parseFreeTradeExtraData().total_value} دينار ليبي`
                  : certificateData?.item_cost
                  ? `${certificateData.item_cost} دينار ليبي`
                  : "________________"}
              </div>
            </td>
          </tr>
          <tr style={{ height: "40pt" }}>
            <td
              style={{
                width: "10%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "35px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "center",
                }}
              >
                {certificateData?.weight || ""}
              </div>
            </td>
            <td
              style={{
                width: "10%",
                border: "1px solid #000000",
                backgroundColor: "#ffffff",
                padding: "1px",
                verticalAlign: "top",
              }}
            >
              <div
                style={{
                  padding: "1px",
                  minHeight: "35px",
                  fontFamily: '"Khalid Art bold"',
                  fontSize: "9pt",
                  textAlign: "center",
                }}
              >
                {certificateData?.net_weight || ""}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MainInfoTable;
