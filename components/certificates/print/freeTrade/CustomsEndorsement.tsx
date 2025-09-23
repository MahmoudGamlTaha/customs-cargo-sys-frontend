import React from "react";

const CustomsEndorsement: React.FC = () => {
  return (
    <div dir="rtl" style={{ textAlign: "left" }}>
      <table
        cellSpacing={0}
        cellPadding={0}
        style={{
          width: "100%",
          margin: "20px 0",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr style={{ height: "20.95pt" }}>
            <td
              style={{
                width: "40%",
                borderBottom: "1px solid #000000",
                verticalAlign: "top",
              }}
            >
              <br />
            </td>
            <td
              style={{
                width: "60%",
                border: "1px solid #000000",
                paddingRight: "4.65pt",
                paddingLeft: "4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  textAlign: "center",
                  fontSize: "9.5pt",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Khalid Art bold'",
                    fontWeight: 900,
                    paddingTop: "10px",
                  }}
                >
                  تأشيرة السلطات الجمركية
                </span>
              </p>
            </td>
          </tr>
          <tr style={{ height: "50pt" }}>
            <td
              style={{
                width: "40%",
                border: "1px solid #000000",
                paddingRight: "4.65pt",
                paddingLeft: "4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: "116%",
                  fontSize: "9.5pt",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Khalid Art bold'",
                    fontWeight: 900,
                  }}
                >
                  توقيع وختم الجهة المصادقة
                </span>
              </p>
            </td>
            <td
              style={{
                width: "60%",
                border: "1px solid #000000",
                paddingRight: "4.65pt",
                paddingLeft: "4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  lineHeight: "116%",
                  fontSize: "9.5pt",
                }}
              >
                <strong>&nbsp;</strong>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CustomsEndorsement;
