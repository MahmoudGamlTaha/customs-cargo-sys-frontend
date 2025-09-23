import React from "react";

interface CertificationSectionProps {
  parseFreeTradeExtraData: () => any;
  certificateData: any;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  parseFreeTradeExtraData,
  certificateData,
}) => {
  return (
    <div
      dir="rtl"
      style={{ marginTop: "10pt", marginBottom: "8pt" }}
    >
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
          تشهد
        </span>
        <span
          style={{
            // borderBottom: "1px solid black",
            // display: "inline-block",
            width: "150px",
            margin: "0 10px",
            height: "20px",
            verticalAlign: "bottom",
          }}
        >
          {parseFreeTradeExtraData()?.certifying_authority || ""}
        </span>
        <span
          style={{
            fontFamily: "'Khalid Art bold'",
            fontWeight: "700",
          }}
        >
          بأن السلع الموضح بياناتها أعلاه هي من منشأ
        </span>
        <span
          style={{
            // borderBottom: "1px solid black",
            // display: "inline-block",
            width: "100px",
            margin: "0 10px",
            height: "20px",
            verticalAlign: "bottom",
          }}
        >
          {parseFreeTradeExtraData()?.goods_origin ||
            certificateData?.standard_of_origin ||
            ""}
        </span>
      </p>
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
          حرر في:
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
          {parseFreeTradeExtraData()?.issue_place || ""}
        </span>
      </p>

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
          بتاريخ
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

      <strong style={{ fontWeight: "900" }}>
        توقيع وختم مصلحة الجمارك الليبية
      </strong>
    </div>
  );
};

export default CertificationSection;
