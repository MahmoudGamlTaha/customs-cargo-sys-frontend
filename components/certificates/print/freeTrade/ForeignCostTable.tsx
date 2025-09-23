import React from "react";

interface ForeignCostTableProps {
  parseForeignCostItems: () => any[];
  calculateForeignItemsTotals: () => { totalQuantity: number; totalValue: number };
}

const ForeignCostTable: React.FC<ForeignCostTableProps> = ({
  parseForeignCostItems,
  calculateForeignItemsTotals,
}) => {
  return (
    <div dir="rtl" style={{ textAlign: "left" }}>
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
          <tr style={{ height: "12pt" }}>
            <td
              style={{
                width: "60%",
                border: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: "9.5pt",
                  lineHeight: "116%",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Khalid Art bold'",
                    fontWeight: 700,
                  }}
                >
                  عناصر التكلفة الأجنبية
                </span>
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: "9.5pt",
                  lineHeight: "116%",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Khalid Art bold'",
                    fontWeight: 700,
                  }}
                >
                  الكمية
                </span>
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: ".3rem 4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                dir="rtl"
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: "9.5pt",
                  lineHeight: "116%",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Khalid Art bold'",
                    fontWeight: 700,
                  }}
                >
                  القيمة
                </span>
              </p>
            </td>
          </tr>
          {parseForeignCostItems()?.map((item: any, index: number) => (
            <tr key={index}>
              <td
                style={{
                  width: "60%",
                  // border: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                  textAlign: "right",
                }}
              >
                <p
                  dir="rtl"
                  style={{
                    margin: "2px 0px",
                    fontSize: "9.5pt",
                    lineHeight: "116%",
                  }}
                >
                  {index + 1}- {item.description || ""}
                </p>
              </td>
              <td
                style={{
                  width: "20%",
                  borderRight: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "center",
                  }}
                >
                  {item.quantity || "________"}
                </p>
              </td>
              <td
                style={{
                  width: "20%",
                  borderRight: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "center",
                  }}
                >
                  {item.value || "________"}
                </p>
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
                  width: "60%",
                  // border: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                  textAlign: "right",
                }}
              >
                <p
                  dir="rtl"
                  style={{
                    margin: "2px 0px",
                    fontSize: "9.5pt",
                    lineHeight: "116%",
                  }}
                >
                  {parseForeignCostItems()?.length + index + 1}-
                </p>
              </td>
              <td
                style={{
                  width: "20%",
                  borderRight: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "center",
                  }}
                >
                  
                </p>
              </td>
              <td
                style={{
                  width: "20%",
                  borderRight: "1px solid #000000",
                  padding: "0 4.65pt",
                  verticalAlign: "top",
                }}
              >
                <p
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "center",
                  }}
                >
                  
                </p>
              </td>
            </tr>
          ))}
          {/* المجموع والتكلفة النهائية للإنتاج */}
          <tr>
            <td
              style={{
                width: "60%",
                // border: "1px solid #000000",
                padding: "0 4.65pt",
                verticalAlign: "top",
                textAlign: "right",
              }}
            >
              <p
                dir="rtl"
                style={{
                  marginTop: "5px",
                  fontSize: "9.5pt",
                  lineHeight: "116%",
                  fontWeight: "700",
                }}
              >
                المجموع:
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: "0 4.65pt",
                verticalAlign: "center",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "9.5pt",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {calculateForeignItemsTotals().totalQuantity || "________"}
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: "0 4.65pt",
                verticalAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "9.5pt",
                  textAlign: "center",
                }}
              >
               
              </p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "60%",
                // border: "1px solid #000000",
                padding: "0 4.65pt",
                verticalAlign: "top",
                textAlign: "right",
              }}
            >
              <p
                dir="rtl"
                style={{
                  marginTop: "3px",
                  fontSize: "9pt",
                  lineHeight: "116%",
                  textAlign: "left",
                  fontWeight: "700",
                }}
              >
                التكلفة النهائية للإنتاج:
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: ".75rem 4.65pt",
                verticalAlign: "top",
              }}
            >
              <p
                style={{
                  fontSize: "9.5pt",
                  textAlign: "center",
                }}
              >
               
              </p>
            </td>
            <td
              style={{
                width: "20%",
                border: "1px solid #000000",
                padding: "0 4.65pt",
                verticalAlign: "center",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "9.5pt",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {calculateForeignItemsTotals().totalValue || "________"}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ForeignCostTable;
