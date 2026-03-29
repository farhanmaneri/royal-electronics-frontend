import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
  ]);

  // Load existing products
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Handle change for item row
  const handleChange = (index, field, value) => {
    const newItems = [...items];

    if (field === "product") {
      if (value === "new") {
        // New product entry
        newItems[index] = {
          ...newItems[index],
          product: "new",
          name: "",
          unitType: "",
          costPrice: 0,
          quantity: 1,
        };
      } else {
        const selected = products.find((p) => p._id === value);
        newItems[index] = {
          ...newItems[index],
          product: selected._id,
          name: selected.name,
          unitType: selected.unitType,
          costPrice: selected.price || 0,
          quantity: 1,
        };
      }
    } else {
      newItems[index][field] = value;
    }

    setItems(newItems);
  };

  // Add a new item row
  const addItem = () => {
    setItems([
      ...items,
      { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
    ]);
  };

  // Remove a row
  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );

  // Save purchase
  const savePurchase = async () => {
    try {
      await axios.post("http://localhost:5000/api/purchases", {
        items,
        totalAmount,
      });
      alert("Purchase saved & stock updated ✅");
      setItems([
        { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error saving purchase");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>New Purchase</h2>

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: 10,
            borderBottom: "1px solid #eee",
            paddingBottom: 5,
          }}
        >
          <select
            value={item.product}
            onChange={(e) => handleChange(i, "product", e.target.value)}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
            <option value="new">+ Add New Product</option>
          </select>

          {/* New product inputs */}
          {item.product === "new" && (
            <>
              <input
                type="text"
                placeholder="Product Name"
                value={item.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                style={{ marginLeft: 5 }}
              />
              <select
                value={item.unitType}
                onChange={(e) => handleChange(i, "unitType", e.target.value)}
                style={{ marginLeft: 5 }}
              >
                <option value="">Select Unit</option>
                <option value="Nos">Nos</option>
                <option value="Meter">Meter</option>
              </select>
            </>
          )}

          {/* Quantity */}
          <input
            type="number"
            placeholder="Qty"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              handleChange(i, "quantity", Number(e.target.value))
            }
            style={{ marginLeft: 5, width: 60 }}
          />

          {/* Cost Price */}
          <input
            type="number"
            placeholder="Cost Price"
            value={item.costPrice}
            onChange={(e) =>
              handleChange(i, "costPrice", Number(e.target.value))
            }
            style={{ marginLeft: 5, width: 80 }}
          />

          <button
            onClick={() => removeItem(i)}
            style={{ marginLeft: 5, color: "red" }}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={addItem} style={{ marginTop: 10 }}>
        + Add Item
      </button>

      <h3>Total: Rs. {totalAmount}</h3>

      <button onClick={savePurchase} style={{ padding: "8px 20px" }}>
        Save Purchase
      </button>
    </div>
  );
};

export default PurchasePage;
