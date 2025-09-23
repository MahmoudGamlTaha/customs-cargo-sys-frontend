import React from "react";

interface DeclarationSectionProps {
  parseFreeTradeExtraData: () => any;
  certificateData: any;
}

const DeclarationSection: React.FC<DeclarationSectionProps> = ({
  parseFreeTradeExtraData,
  certificateData,
}) => {
  return (
    <>
      {/* Value Added Checkboxes */}
      <div dir="rtl" style={{ marginTop: "8pt", marginBottom: "8pt" }}>
        <p
          dir="rtl"
          style={{
            marginTop: "0pt",
            marginBottom: "4pt",
            lineHeight: "1.4",
            fontSize: "10pt",
          }}
        >
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            وأن (1)
          </span>
          <span style={{ fontFamily: "Wingdings", margin: "0 5px 0px" }}>☐</span>
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            القيمة المضافة المحلية
          </span>
          <span style={{ margin: "0 150px 0px 0px" }}>/</span>
          <span style={{ fontFamily: "Wingdings", margin: "0 5px" }}>☐</span>
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            القيمة المضافة المغاربية
          </span>
        </p>
      </div>

      {/* Percentage Section */}
      <div dir="rtl" style={{ marginTop: "8pt", marginBottom: "8pt" }}>
        <p
          dir="rtl"
          style={{
            marginTop: "0pt",
            marginBottom: "4pt",
            lineHeight: "1.4",
            fontSize: "10pt",
          }}
        >
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            تمثل نسبة (رقما وكتابة)
          </span>
          <span
            style={{
              // borderBottom: "1px solid black",
              // display: "inline-block",
              width: "120px",
              margin: "0 10px 0 100px",
              height: "20px",
              verticalAlign: "bottom",
            }}
          >
            {parseFreeTradeExtraData()?.value_added_percentage || ""}
          </span>
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            من كلفة الإنتاج الكلية
          </span>
        </p>
      </div>

      {/* Date and Signature Section */}
      <div dir="rtl" style={{ marginTop: "10pt", marginBottom: "8pt" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5pt",
          }}
        >
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
              fontSize: "10pt",
            }}
          >
            حرر في: {parseFreeTradeExtraData()?.issue_place || ""}
          </span>
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
              fontSize: "10pt",
            }}
          >
            التوقيع
          </span>
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
              fontSize: "10pt",
            }}
          ></span>
        </div>
        <p
          dir="rtl"
          style={{
            marginTop: "0pt",
            marginBottom: "4pt",
            lineHeight: "1.4",
            fontSize: "10pt",
          }}
        >
          <span
            style={{
              fontFamily: "'Khalid Art bold'",
              fontWeight: "700",
            }}
          >
            بتاريخ:
          </span>
          <span
            style={{
              // borderBottom: "1px solid black",
              // display: "inline-block",
              width: "200px",
              margin: "0 10px",
              height: "20px",
              verticalAlign: "bottom",
            }}
          >
            {parseFreeTradeExtraData()?.issue_date || ""}
          </span>
        </p>
      </div>
    </>
  );
};

export default DeclarationSection;
