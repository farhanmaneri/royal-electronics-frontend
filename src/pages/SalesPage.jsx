import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Link } from "react-router-dom";
import SaleReceipt from "../components/SaleReceipt";
const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in");
  const [items, setItems] = useState([
    { product: "", name: "", quantity: 1, price: 0, unitType: "" },
  ]);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);

  const receiptRef = useRef(null);

  // ✅ Load products on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  // ✅ Handle product select or quantity change
  const handleChange = (index, field, value) => {
    const newItems = [...items];

    if (field === "product") {
      const selected = products.find((p) => p._id === value);
      newItems[index] = {
        ...newItems[index],
        product: value,
        name: selected?.name || "",
        price: selected?.price || 0,
        unitType: selected?.unitType || "",
        stock: selected?.stock || 0,
      };
    } else if (field === "quantity") {
      const qty = Number(value);
      const maxStock = newItems[index].stock || 9999;
      newItems[index].quantity = qty < 1 ? 1 : qty > maxStock ? maxStock : qty;
    } else {
      newItems[index][field] = value;
    }

    setItems(newItems);
  };

  // ✅ Add a new empty item row
  const addItem = () => {
    setItems([
      ...items,
      { product: "", name: "", quantity: 1, price: 0, unitType: "" },
    ]);
  };

  // ✅ Remove an item row
  const removeItem = (index) => {
    if (items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // ✅ Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // ✅ Print receipt (react-to-print v3)
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Sale_${new Date().toLocaleDateString()}`,
  });

  // ✅ Save sale to backend
const createSale = async () => {
  if (!customerName.trim()) {
    alert("Please enter a customer name.");
    return;
  }

  for (let item of items) {
    if (!item.product) {
      alert("Please select a product for all items.");
      return;
    }
  }

  setLoading(true);
  try {
    const res = await axios.post("http://localhost:5000/api/sales", {
      customer: customerName,
      items,
      totalAmount,
    });

    const savedSale = res.data?.sale || res.data;
    setSale(savedSale);

    // ✅ 🔥 RELOAD PRODUCTS (IMPORTANT)
    const updatedProducts = await axios.get(
      "http://localhost:5000/api/products",
    );
    setProducts(updatedProducts.data);

    alert("Sale saved successfully!");
  } catch (error) {
    console.error("Sale error:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  // ✅ Reset form for a new sale
  const resetSale = () => {
    setCustomerName("Walk-in");
    setItems([{ product: "", name: "", quantity: 1, price: 0, unitType: "" }]);
    setSale(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h2>Royal Electronics - New Sale</h2>
      {/* Customer Name */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          <strong>Customer Name:</strong>
        </label>
        <br />
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ padding: "5px", width: "250px", marginTop: "5px" }}
        />
      </div>
      {/* Item Rows */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>Product</th>
            <th style={th}>Qty</th>
            <th style={th}>Price</th>
            <th style={th}>Unit</th>
            <th style={th}>Subtotal</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={td}>
                <select
                  value={item.product}
                  onChange={(e) =>
                    handleChange(index, "product", e.target.value)
                  }
                  style={{ width: "160px" }}
                >
                  <option value="">-- Select --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </td>

              <td style={td}>
                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) =>
                    handleChange(index, "quantity", e.target.value)
                  }
                  style={{ width: "55px" }}
                />
              </td>

              <td style={td}>
                <input
                  type="number"
                  value={item.price}
                  readOnly
                  style={{ width: "70px", background: "#f9f9f9" }}
                />
              </td>


              <td style={td}>
                {(item.quantity * item.price).toLocaleString()}
              </td>

              <td style={td}>
                <button
                  onClick={() => removeItem(index)}
                  style={{ color: "red" }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/">
          <button>Sales</button>
        </Link>

        <Link to="/purchase">
          <button>Purchase</button>
        </Link>
        <Link to="/products">
          <button>Products</button>
        </Link>
      </div>
      <button onClick={addItem} style={{ marginBottom: "15px" }}>
        + Add Item
      </button>
      {/* Total */}
      <h3>Total: Rs. {totalAmount.toLocaleString()}</h3>
      {/* Save Button */}
      <button
        onClick={createSale}
        disabled={loading}
        style={{
          padding: "8px 20px",
          marginRight: "10px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Sale"}
      </button>
      {/* After sale is saved */}
      {sale && (
        <>
          <button
            onClick={handlePrint}
            style={{
              padding: "8px 20px",
              marginRight: "10px",
              background: "#2196F3",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Print Receipt
          </button>

          <button
            onClick={resetSale}
            style={{
              padding: "8px 20px",
              background: "#ff9800",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            New Sale
          </button>

          {/* Receipt visible on screen */}
          <div
            style={{
              marginTop: "30px",
              borderTop: "2px dashed #ccc",
              paddingTop: "20px",
            }}
          >
            <h3>Receipt Preview</h3>
            <SaleReceipt ref={receiptRef} sale={sale} />
          </div>
        </>
      )}
    </div>
  );
};

// Simple style helpers
const th = {
  padding: "8px",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
};
const td = { padding: "6px", borderBottom: "1px solid #eee" };

export default SalesPage;
