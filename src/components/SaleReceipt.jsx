import React, { forwardRef } from "react";

const SaleReceipt = forwardRef(({ sale }, ref) => {
  if (!sale) return null;

  return (
    <div
      ref={ref}
      style={{
        padding: "20px",
        fontFamily: "Arial",
        width: "300px",
      }}
    >
      {/* Header */}
      <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
        Royal Electronics
      </h2>
      <p style={{ textAlign: "center", margin: "0" }}>Sales Receipt</p>

      <hr />

      {/* Info */}
      <p>
        <strong>Invoice:</strong> {sale?.invoiceNumber || "-"}
      </p>
      <p>
        <strong>Customer:</strong> {sale?.customer || "-"}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {sale?.createdAt ? new Date(sale.createdAt).toLocaleString() : "-"}
      </p>

      <hr />

      {/* Items */}
      <div>
        {sale?.items && sale.items.length > 0 ? (
          sale.items.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "8px",
                borderBottom: "1px dashed #ccc",
                paddingBottom: "5px",
              }}
            >
              <div>{item.name}</div>
              <div style={{ fontSize: "12px" }}>
                {item.quantity} x {item.price} = {item.quantity * item.price}
              </div>
            </div>
          ))
        ) : (
          <p>No items</p>
        )}
      </div>

      <hr />

      {/* Total */}
      <h3 style={{ textAlign: "right" }}>Total: {sale?.totalAmount || 0}</h3>

      <hr />

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: "12px" }}>
        Thank you for your purchase!
      </p>
    </div>
  );
});

export default SaleReceipt;
