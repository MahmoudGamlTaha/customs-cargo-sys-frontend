import React from "react";

interface HeaderProps {
  leftLogo?: string | null;
  rightLogo?: string | null;
  chamberName: string;
  certificateNumber: string;
}

const Header: React.FC<HeaderProps> = ({
  leftLogo,
  rightLogo,
  chamberName,
  certificateNumber,
}) => {
  return (
    <>
      {/* Header with logos */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          margin: "0 auto",
          marginBottom: "5px",
          width: "90%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            // width: "150px",
          }}
        >
          <img
            src={
              rightLogo ||
              "/src/images/free-trade-print/free-trade-logo-right.png"
            }
            alt="Free Trade Logo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
          />
        </div>
        <div style={{ textAlign: "center", flexGrow: 1 }}>
          <div
            style={{
              fontSize: "30px",
              fontWeight: "900",
              margin: "5px 0",
              color: "#000",
            }}
          >
            دولة ليبيا
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              margin: "3px 0",
              color: "#000",
            }}
          >
            شهــــــادة منشــــــــأ
          </div>
          <div
            style={{
              fontSize: "14px",
              margin: "8px 0",
              lineHeight: "1.4",
            }}
          >
            بموجب إتفاقية منطقة تبادل حر الموقعة بين الجمهورية التونسية ودولة
            ليبيا بتاريخ 2001/06/14
          </div>
        </div>
        <div
          style={{
            // width: "150px",
            textAlign: "center",
          }}
        >
          <img
            src={
              leftLogo ||
              "/src/images/free-trade-print/free-trade-logo-left.png"
            }
            alt="Libya Logo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Issuing Information */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          // margin: "5px 0px",
          fontSize: "14px",
          maxWidth: "85%",
          margin: "0 auto",
        }}
      >
        <div>صادرة عن مصلحة الجمارك الليبية / {chamberName}</div>
        <div>
          رقم الشهادة: <span style={{ direction: "ltr", unicodeBidi: "bidi-override" }}>{certificateNumber} </span>
        </div>
      </div>
    </>
  );
};

export default Header;
