import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
  ]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "product") {
      if (value === "new") {
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

  const addItem = () => {
    setItems([
      ...items,
      { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );

  const savePurchase = async () => {
    for (let item of items) {
      if (!item.product) {
        alert("Please select a product for all items.");
        return;
      }
      if (item.product === "new" && !item.name.trim()) {
        alert("Please enter a name for the new product.");
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/purchases`, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            New Purchase
          </h1>
          <p className="text-gray-500 text-sm mt-1">Royal Electronics</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Product</th>
                  <th className="px-4 py-3 text-left">New Product Name</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Cost Price</th>
                  <th className="px-4 py-3 text-left">Subtotal</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {/* Product Select */}
                    <td className="px-4 py-3">
                      <select
                        value={item.product}
                        onChange={(e) =>
                          handleChange(i, "product", e.target.value)
                        }
                        className="w-44 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Select --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                        <option value="new">+ Add New Product</option>
                      </select>
                    </td>

                    {/* New Product Name */}
                    <td className="px-4 py-3">
                      {item.product === "new" ? (
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={item.name}
                          onChange={(e) =>
                            handleChange(i, "name", e.target.value)
                          }
                          className="w-36 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3">
                      {item.product === "new" ? (
                        <select
                          value={item.unitType}
                          onChange={(e) =>
                            handleChange(i, "unitType", e.target.value)
                          }
                          className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select Unit</option>
                          <option value="Nos">Nos</option>
                          <option value="Meter">Meter</option>
                        </select>
                      ) : (
                        <span className="text-gray-600 text-sm">
                          {item.unitType || "—"}
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleChange(i, "quantity", Number(e.target.value))
                        }
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>

                    {/* Cost Price */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.costPrice}
                        onChange={(e) =>
                          handleChange(i, "costPrice", Number(e.target.value))
                        }
                        className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      Rs. {(item.quantity * item.costPrice).toLocaleString()}
                    </td>

                    {/* Remove */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                {/* Product Select */}
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Product
                  </label>
                  <select
                    value={item.product}
                    onChange={(e) => handleChange(i, "product", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                    <option value="new">+ Add New Product</option>
                  </select>
                </div>

                {/* New Product Fields */}
                {item.product === "new" && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        Product Name
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) =>
                          handleChange(i, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        Unit Type
                      </label>
                      <select
                        value={item.unitType}
                        onChange={(e) =>
                          handleChange(i, "unitType", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="">Select Unit</option>
                        <option value="Nos">Nos</option>
                        <option value="Meter">Meter</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Qty & Cost Price */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleChange(i, "quantity", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      Cost Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={item.costPrice}
                      onChange={(e) =>
                        handleChange(i, "costPrice", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Subtotal & Remove */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Subtotal: Rs.{" "}
                    {(item.quantity * item.costPrice).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeItem(i)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="mt-4 px-4 py-2 border-2 border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 rounded-xl text-sm font-medium w-full transition"
          >
            + Add Item
          </button>

          {/* Total */}
          <div className="mt-6 flex justify-end">
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-right">
              <p className="text-sm text-green-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-green-700">
                Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={savePurchase}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition text-sm"
            >
              {loading ? "Saving..." : "💾 Save Purchase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
