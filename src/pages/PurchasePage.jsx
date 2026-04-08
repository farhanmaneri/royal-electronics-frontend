import React, { useEffect, useState } from "react";
import axios from "axios";


// ✅ Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-white text-sm font-medium ${styles[type]}`}
    >
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white opacity-70 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

const PurchasePage = () => {
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsConnected, setProductsConnected] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
  ]);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("new");
  const [historyConnected, setHistoryConnected] = useState(false);

  // History states
  const [purchases, setPurchases] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const showToast = (message, type = "success") => setToast({ message, type });



useEffect(() => {
  const fetchProducts = async (retry = 0) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products`
      );

      setProducts(res.data);
      setProductsConnected(true);
      setProductsLoading(false);
    } catch (err) {
      console.log("Retrying products...", retry);

      if (retry < 5) {
        setTimeout(() => fetchProducts(retry + 1), 2000);
      } else {
        setProductsLoading(false);
        showToast("Failed to connect to server", "error");
      }
    }
  };

  fetchProducts();
}, []);

  // const fetchPurchases = async () => {
  //   setHistoryLoading(true);
  //   try {
  //     const params = {};
  //     if (supplier) params.supplier = supplier;
  //     if (startDate) params.startDate = startDate;
  //     if (endDate) params.endDate = endDate;

  //     const res = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/api/purchases`,
  //       { params },
  //     );
  //     setPurchases(res.data);
  //   } catch (err) {
  //     showToast("Failed to load purchase history", "error");
  //   } finally {
  //     setHistoryLoading(false);
  //   }
  // };
const fetchPurchases = async (retryCount = 0) => {
  setHistoryLoading(true);

  try {
    const params = {};
    if (supplier) params.supplier = supplier;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/purchases`,
      { params }
    );

    setPurchases(res.data);
    setHistoryConnected(true);
  } catch (err) {
    if (err.response?.status === 500 && retryCount < 5) {
      console.log(`Retrying history... ${retryCount + 1}`);
      setTimeout(() => fetchPurchases(retryCount + 1), 1500);
      return;
    }

    setHistoryConnected(false);
    showToast("Server not responding", "error");
  } finally {
    setHistoryLoading(false);
  }
};
  useEffect(() => {
    if (activeTab === "history") fetchPurchases();
  }, [activeTab]);

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
    if (items.length === 1) {
      showToast("At least one item is required.", "error");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );

  const savePurchase = async () => {
    for (let item of items) {
      if (!item.product) {
        showToast("Please select a product for all items.", "error");
        return;
      }
      if (item.product === "new" && !item.name.trim()) {
        showToast("Please enter a name for the new product.", "error");
        return;
      }
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        items,
        totalAmount,
      });
      showToast("Purchase saved & stock updated!", "success");
      setItems([
        { product: "", name: "", quantity: 1, costPrice: 0, unitType: "" },
      ]);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Error saving purchase",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Purchases
          </h1>
          <p className="text-gray-500 text-sm mt-1">Royal Electronics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "new"
                ? "bg-green-600 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            🛒 New Purchase
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "history"
                ? "bg-green-600 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            📋 Purchase History
          </button>
        </div>

        {/* ====== NEW PURCHASE TAB ====== */}
        {activeTab === "new" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <th className="px-4 py-3 text-left rounded-tl-lg">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left">New Product Name</th>
                    <th className="px-4 py-3 text-left">Unit</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Cost Price</th>
                    <th className="px-4 py-3 text-left">Subtotal</th>
                    <th className="px-4 py-3 text-left rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <select
                          value={item.product}
                          onChange={(e) =>
                            handleChange(i, "product", e.target.value)
                          }
                          className="w-44 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                          
 {productsLoading || !productsConnected ? (
  <option>Connecting to server...</option>
) : (
    <>
      <option value="">-- Select Product --</option>
      {products.map((p) => (
        <option key={p._id} value={p._id}>
          {p.name} (Stock: {p.stock})
        </option>
      ))}
    </>
  )}
</select>
                      </td>
                      <td className="px-4 py-3">
                        {item.product === "new" ? (
                          <input
                            type="text"
                            placeholder="Product Name"
                            value={item.name}
                            onChange={(e) =>
                              handleChange(i, "name", e.target.value)
                            }
                            className="w-36 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.product === "new" ? (
                          <select
                            value={item.unitType}
                            onChange={(e) =>
                              handleChange(i, "unitType", e.target.value)
                            }
                            className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleChange(i, "quantity", Number(e.target.value))
                          }
                          className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.costPrice}
                          onChange={(e) =>
                            handleChange(i, "costPrice", Number(e.target.value))
                          }
                          className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        Rs. {(item.quantity * item.costPrice).toLocaleString()}
                      </td>
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
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      Product
                    </label>
                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleChange(i, "product", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                        >
                          <option value="">Select Unit</option>
                          <option value="Nos">Nos</option>
                          <option value="Meter">Meter</option>
                        </select>
                      </div>
                    </div>
                  )}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  </div>
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

            {/* Add Item */}
            <button
              onClick={addItem}
              className="mt-4 px-4 py-2 border-2 border-dashed border-green-300 text-green-500 hover:bg-green-50 rounded-xl text-sm font-medium w-full transition"
            >
              + Add Item
            </button>

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-right">
                <p className="text-sm text-green-600 font-medium">
                  Total Amount
                </p>
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
        )}

        {/* ====== PURCHASE HISTORY TAB ====== */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            {/* Search Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="🔍 Supplier name..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={fetchPurchases}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition"
              >
                🔍 Search
              </button>
              <button
                onClick={() => {
                  setSupplier("");
                  setStartDate("");
                  setEndDate("");
                  setTimeout(fetchPurchases, 100);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition"
              >
                🔄 Reset
              </button>
            </div>

            {/* Purchase List */}
{historyLoading || !historyConnected ? (  <div className="py-10 text-center">
    <div className="w-10 h-10 rounded-full border-4 border-green-100 border-t-green-600 animate-spin mx-auto mb-3"></div>
    <p className="text-gray-400 text-sm">Loading purchase history...</p>
  </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No purchases found
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p, idx) => (
                  <div
                    key={p._id}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                  >
                    {/* Purchase Header */}
                    <div className="flex flex-wrap justify-between items-center mb-3">
                      <div>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold">
                          PUR-{String(idx + 1).padStart(3, "0")}
                        </span>
                        {p.supplier && (
                          <span className="ml-3 font-semibold text-gray-800">
                            {p.supplier}
                          </span>
                        )}
                      </div>
                      <div className="text-right mt-1 sm:mt-0">
                        <p className="text-lg font-bold text-green-600">
                          Rs. {p.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Purchase Items */}
                    <div className="border-t border-gray-100 pt-3 space-y-1">
                      {p.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm text-gray-600"
                        >
                          <span>
                            {item.name || item.product?.name || "Product"}
                          </span>
                          <span>
                            {item.quantity} × Rs.{" "}
                            {item.costPrice?.toLocaleString()} =
                            <span className="font-semibold text-gray-800 ml-1">
                              Rs.{" "}
                              {(
                                item.quantity * item.costPrice
                              )?.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchasePage;
