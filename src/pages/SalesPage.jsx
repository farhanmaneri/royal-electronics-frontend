import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import SaleReceipt from "../components/SaleReceipt";

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
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-white text-sm font-medium ${styles[type]}`}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Walk-in");
  const [items, setItems] = useState([
    { product: "", name: "", quantity: 1, price: 0, unitType: "" },
  ]);
  const [discount, setDiscount] = useState(0);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Sales History
  const [sales, setSales] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("new");

  const receiptRef = useRef(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setProductsLoading(false));
  }, []);

  const fetchSales = async (retryCount = 0) => {
    setHistoryLoading(true);
    try {
      const params = {};
      if (invoice) params.invoice = invoice;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sales`, { params });
      setSales(res.data);
    } catch (err) {
      if (err.response?.status === 500 && retryCount < 3) {
        setTimeout(() => fetchSales(retryCount + 1), 1500);
        return;
      }
      showToast("Failed to load sales history", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchSales();
  }, [activeTab]);

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

  const addItem = () => {
    setItems([...items, { product: "", name: "", quantity: 1, price: 0, unitType: "" }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      showToast("At least one item is required.", "error");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // ✅ Subtotal and final total with discount
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const finalTotal = subtotal - discount;

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Sale_${new Date().toLocaleDateString()}`,
  });

 const createSale = async () => {
  if (!customerName.trim()) {
    showToast("Please enter a customer name.", "error");
    return;
  }
  for (let item of items) {
    if (!item.product) {
      showToast("Please select a product for all items.", "error");
      return;
    }
  }
  if (discount > subtotal) {
    showToast("Discount cannot be greater than subtotal.", "error");
    return;
  }

  setLoading(true);
  try {
    let savedSale;

    if (sale?._id) {
      // ✅ Sale already exists — UPDATE it
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/sales/${sale._id}`,
        { customer: customerName, items, discount }
      );
      savedSale = res.data?.sale || res.data;
      showToast(`Sale updated! Invoice: ${savedSale.invoiceNumber}`, "success");
    } else {
      // ✅ No sale yet — CREATE new
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales`,
        { customer: customerName, items, discount }
      );
      savedSale = res.data?.sale || res.data;
      showToast(`Sale saved! Invoice: ${savedSale.invoiceNumber}`, "success");
    }

    setSale(savedSale);
    const updatedProducts = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
    setProducts(updatedProducts.data);

  } catch (error) {
    showToast(error.response?.data?.message || "Error saving sale", "error");
  } finally {
    setLoading(false);
  }
};

  const resetSale = () => {
    setCustomerName("Walk-in");
    setItems([{ product: "", name: "", quantity: 1, price: 0, unitType: "" }]);
    setDiscount(0);
    setSale(null);
    showToast("Ready for new sale!", "info");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-500 text-sm mt-1">Royal Electronics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "new" ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            💰 New Sale
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "history" ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            📋 Sales History
          </button>
        </div>

        {/* ====== NEW SALE TAB ====== */}
        {activeTab === "new" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">

              {/* Customer Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <th className="px-4 py-3 text-left rounded-tl-lg">Product</th>
                      <th className="px-4 py-3 text-left">Qty</th>
                      <th className="px-4 py-3 text-left">Price (Rs.)</th>
                      <th className="px-4 py-3 text-left">Unit</th>
                      <th className="px-4 py-3 text-left">Subtotal</th>
                      <th className="px-4 py-3 text-left rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <select
                            value={item.product}
                            onChange={(e) => handleChange(index, "product", e.target.value)}
                            className="w-48 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {productsLoading ? (
                              <option>Loading...</option>
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
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            onChange={(e) => handleChange(index, "quantity", e.target.value)}
                            className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleChange(index, "price", Number(e.target.value))}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.unitType || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          Rs. {(item.quantity * item.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeItem(index)}
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
              <div className="md:hidden space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Product</label>
                      <select
                        value={item.product}
                        onChange={(e) => handleChange(index, "product", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        {productsLoading ? (
                          <option>Loading...</option>
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
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          onChange={(e) => handleChange(index, "quantity", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (Rs.)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleChange(index, "price", Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">
                        Subtotal: Rs. {(item.quantity * item.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
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
                className="mt-4 px-4 py-2 border-2 border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 rounded-xl text-sm font-medium w-full transition"
              >
                + Add Item
              </button>

              {/* ✅ Subtotal, Discount, Final Total */}
              <div className="mt-6 flex justify-end">
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 w-full md:w-72 space-y-3">

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-800">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount input */}
                  <div className="flex justify-between items-center text-sm">
                    <label className="text-gray-600 font-medium">Discount (Rs.)</label>
                    <input
                      type="number"
                      value={discount}
                      min={0}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right"
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-blue-200"></div>

                  {/* Final Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold text-sm">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-700">
                      Rs. {finalTotal.toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={createSale}
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition text-sm"
                >
{loading ? "Saving..." : sale ? "✏️ Update Sale" : "💾 Save Sale"}                </button>
                {sale && (
                  <>
                    <button
                      onClick={handlePrint}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm"
                    >
                      🖨️ Print Receipt
                    </button>
                    <button
                      onClick={resetSale}
                      className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition text-sm"
                    >
                      🔄 New Sale
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Preview */}
            {sale && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-dashed border-gray-300">
                  🧾 Receipt Preview
                </h3>
                <SaleReceipt ref={receiptRef} sale={sale} />
              </div>
            )}
          </>
        )}

        {/* ====== SALES HISTORY TAB ====== */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">

            {/* Search Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="🔍 Invoice number..."
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={fetchSales}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
              >
                🔍 Search
              </button>
              <button
                onClick={() => {
                  setInvoice("");
                  setStartDate("");
                  setEndDate("");
                  setTimeout(fetchSales, 100);
                }}
                className="px-5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition"
              >
                🔄 Reset
              </button>
            </div>

            {/* Sales List */}
            {historyLoading ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading sales history...</p>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No sales found</div>
            ) : (
              <div className="space-y-3">
                {sales.map((s) => (
                  <div key={s._id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition">
                    <div className="flex flex-wrap justify-between items-center mb-3">
                      <div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                          {s.invoiceNumber}
                        </span>
                        <span className="ml-3 font-semibold text-gray-800">{s.customer}</span>
                      </div>
                      <div className="text-right mt-1 sm:mt-0">
                        <p className="text-lg font-bold text-green-600">
                          Rs. {s.totalAmount?.toLocaleString()}
                        </p>
                        {s.discount > 0 && (
                          <p className="text-xs text-orange-500 font-medium">
                            Discount: Rs. {s.discount?.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(s.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 space-y-1">
                      {s.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-600">
                          <span>{item.name || item.product?.name || "Product"}</span>
                          <span>
                            {item.quantity} × Rs. {item.price?.toLocaleString()} =
                            <span className="font-semibold text-gray-800 ml-1">
                              Rs. {(item.quantity * item.price)?.toLocaleString()}
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
};

export default SalesPage;