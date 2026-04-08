import React, { forwardRef } from "react";

const SaleReceipt = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

 
const subtotal = sale.totalAmount || 0;  // subtotal before discount
const discount = sale.discount || 0;
const total = sale.finalAmount || sale.totalAmount || 0; // ✅ use finalAmount
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Arial', sans-serif",
        width: "320px",
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: "24px 20px",
        fontSize: "13px",
        color: "#1a1a1a",
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "22px", marginBottom: "4px" }}>👑</div>
        <h2 style={{
          margin: "0 0 4px 0",
          fontSize: "18px",
          fontWeight: "bold",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}>
          Royal Electronics
        </h2>
        <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>
          Sales Receipt
        </p>
      </div>

      {/* ===== DIVIDER ===== */}
      <div style={{
        borderTop: "2px dashed #ccc",
        margin: "12px 0",
      }} />

      {/* ===== INVOICE INFO ===== */}
      <div style={{ marginBottom: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "2px 0", color: "#666" }}>Invoice</td>
              <td style={{ padding: "2px 0", textAlign: "right", fontWeight: "bold" }}>
                {sale?.invoiceNumber || "—"}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", color: "#666" }}>Customer</td>
              <td style={{ padding: "2px 0", textAlign: "right", fontWeight: "bold" }}>
                {sale?.customer || "Walk-in"}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", color: "#666" }}>Date</td>
              <td style={{ padding: "2px 0", textAlign: "right" }}>
                {sale?.createdAt
                  ? new Date(sale.createdAt).toLocaleString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== DIVIDER ===== */}
      <div style={{ borderTop: "2px dashed #ccc", margin: "12px 0" }} />

      {/* ===== ITEMS HEADER ===== */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#666",
        fontWeight: "bold",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}>
        <span style={{ flex: 2 }}>Item</span>
        <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
        <span style={{ flex: 1, textAlign: "center" }}>Rate</span>
        <span style={{ flex: 1, textAlign: "right" }}>Amt</span>
      </div>

      {/* ===== ITEMS ===== */}
      {sale?.items && sale.items.length > 0 ? (
        sale.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "6px 0",
              borderBottom: "1px dashed #eee",
              fontSize: "12px",
            }}
          >
            <span style={{ flex: 2, fontWeight: "500" }}>
              {item.name}
              {item.unitType && (
                <span style={{ fontSize: "10px", color: "#888", display: "block" }}>
                  {item.unitType}
                </span>
              )}
            </span>
            <span style={{ flex: 1, textAlign: "center", color: "#444" }}>
              {item.quantity}
            </span>
            <span style={{ flex: 1, textAlign: "center", color: "#444" }}>
              {item.price?.toLocaleString()}
            </span>
            <span style={{ flex: 1, textAlign: "right", fontWeight: "600" }}>
              {(item.quantity * item.price)?.toLocaleString()}
            </span>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#999" }}>No items</p>
      )}

      {/* ===== DIVIDER ===== */}
      <div style={{ borderTop: "2px dashed #ccc", margin: "12px 0" }} />

      {/* ===== TOTALS ===== */}
      <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
        <tbody>

          {/* Subtotal */}
          <tr>
            <td style={{ padding: "3px 0", color: "#666" }}>Subtotal</td>
            <td style={{ padding: "3px 0", textAlign: "right" }}>
              Rs. {subtotal.toLocaleString()}
            </td>
          </tr>

          {/* Discount — only show if applied */}
          {discount > 0 && (
            <tr>
              <td style={{ padding: "3px 0", color: "#e67e22" }}>
                Discount
              </td>
              <td style={{ padding: "3px 0", textAlign: "right", color: "#e67e22", fontWeight: "600" }}>
                - Rs. {discount.toLocaleString()}
              </td>
            </tr>
          )}

          {/* Final Total */}
          <tr>
            <td style={{
              padding: "8px 0 3px 0",
              fontWeight: "bold",
              fontSize: "14px",
              borderTop: "1px solid #ddd",
            }}>
              Total
            </td>
            <td style={{
              padding: "8px 0 3px 0",
              textAlign: "right",
              fontWeight: "bold",
              fontSize: "16px",
              borderTop: "1px solid #ddd",
            }}>
              Rs. {total.toLocaleString()}
            </td>
          </tr>

        </tbody>
      </table>

      {/* ===== DIVIDER ===== */}
      <div style={{ borderTop: "2px dashed #ccc", margin: "12px 0" }} />

      {/* ===== FOOTER ===== */}
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "600" }}>
          Thank you for your purchase! 🙏
        </p>
        <p style={{ margin: "0", fontSize: "10px", color: "#999" }}>
          Please visit again
        </p>
      </div>

    </div>
  );
});

export default SaleReceipt;