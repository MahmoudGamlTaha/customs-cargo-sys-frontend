import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface FooterProps {
  qrData: string;
}

const Footer: React.FC<FooterProps> = ({ qrData }) => {
  return (
    <div
      style={{
        marginTop: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      {/* Instructions Section */}
      <div style={{ fontSize: "9pt", textAlign: "right" }}>
        <span
          style={{
            fontFamily: "'Khalid Art bold'",
            fontWeight: "900",
          }}
        >
          (أ): وضع علامة (X) في الخانة المناسبة
        </span>
      </div>

      {/* QR Code Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            border: "1px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
          }}
        >
          <QRCodeSVG
            value={qrData}
            size={60}
            level="M"
            includeMargin={false}
          />
        </div>
        <div
          style={{
            fontSize: "7pt",
            marginTop: "3px",
            textAlign: "center",
            fontFamily: "'Khalid Art bold'",
            fontWeight: 500,
          }}
        >
          QR Code
        </div>
      </div>
    </div>
  );
};

export default Footer;
