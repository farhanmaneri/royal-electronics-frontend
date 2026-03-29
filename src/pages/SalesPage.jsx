import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
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

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

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
    setItems([
      ...items,
      { product: "", name: "", quantity: 1, price: 0, unitType: "" },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      alert("At least one item is required.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Sale_${new Date().toLocaleDateString()}`,
  });

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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales`,
        {
          customer: customerName,
          items,
          totalAmount,
        },
      );
      const savedSale = res.data?.sale || res.data;
      setSale(savedSale);
      const updatedProducts = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products`,
      );
      setProducts(updatedProducts.data);
      alert("Sale saved successfully!");
    } catch (error) {
      console.error("Sale error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSale = () => {
    setCustomerName("Walk-in");
    setItems([{ product: "", name: "", quantity: 1, price: 0, unitType: "" }]);
    setSale(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            New Sale
          </h1>
          <p className="text-gray-500 text-sm mt-1">Royal Electronics</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          {/* Customer Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Items Table - Desktop */}
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
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <select
                        value={item.product}
                        onChange={(e) =>
                          handleChange(index, "product", e.target.value)
                        }
                        className="w-48 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) =>
                          handleChange(index, "quantity", e.target.value)
                        }
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.price}
                        readOnly
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.unitType || "—"}
                    </td>
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

          {/* Items Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">
                    Product
                  </label>
                  <select
                    value={item.product}
                    onChange={(e) =>
                      handleChange(index, "product", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) =>
                        handleChange(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Subtotal: Rs.{" "}
                    {(item.quantity * item.price).toLocaleString()}
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

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="mt-4 px-4 py-2 border-2 border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 rounded-xl text-sm font-medium w-full transition"
          >
            + Add Item
          </button>

          {/* Total */}
          <div className="mt-6 flex justify-end">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 text-right">
              <p className="text-sm text-blue-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-blue-700">
                Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={createSale}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition text-sm"
            >
              {loading ? "Saving..." : "💾 Save Sale"}
            </button>

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
      </div>
    </div>
  );
};

export default SalesPage;
