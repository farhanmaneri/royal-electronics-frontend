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
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-white text-sm font-medium ${styles[type]}`}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
};

const ProductsPage = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    unitType: "",
    price: "",   // ✅ empty string so placeholder shows
    stock: "",   // ✅ empty string so placeholder shows
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // ✅ Fetch products with retry
  const fetchProducts = async (retry = 0) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      setProducts(res.data);
      setFilteredProducts(res.data);
      setPageLoading(false);
    } catch (err) {
      if (retry < 5) {
        setTimeout(() => fetchProducts(retry + 1), 2000);
      } else {
        setPageLoading(false);
        showToast("Server not responding ❌", "error");
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Search & filter
  useEffect(() => {
    let filtered = [...products];
    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterUnit) {
      filtered = filtered.filter((p) => p.unitType === filterUnit);
    }
    setFilteredProducts(filtered);
  }, [search, filterUnit, products]);

  // ✅ Add new product
  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.unitType) {
      showToast("Name and Unit Type are required!", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, {
        ...newProduct,
        price: Number(newProduct.price) || 0,  // ✅ convert to number
        stock: Number(newProduct.stock) || 0,  // ✅ convert to number
      });
      showToast("Product added successfully!", "success");
      setNewProduct({ name: "", unitType: "", price: "", stock: "" }); // ✅ reset to empty
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Error adding product", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update product
  const updateProduct = async (id, field, value) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        [field]: value,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast("Error updating product", "error");
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      showToast("Product deleted successfully", "success");
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting product", "error");
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

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your products, prices and stock</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase">Total Products</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase">Showing</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{filteredProducts.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 font-medium uppercase">Low Stock</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {products.filter((p) => p.stock <= 5).length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Search & Filter</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Units</option>
              <option value="Nos">Nos</option>
              <option value="Meter">Meter</option>
            </select>
          </div>
        </div>

        {/* Add New Product */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">➕ Add New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={newProduct.unitType}
              onChange={(e) => setNewProduct({ ...newProduct, unitType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Select Unit</option>
              <option value="Nos">Nos</option>
              <option value="Meter">Meter</option>
            </select>
            <input
              type="number"
              placeholder="Price (Rs.)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={saveProduct}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? "Saving..." : "✅ Add Product"}
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">📦 All Products</h2>
          </div>

          {/* Loading spinner */}
          {pageLoading ? (
            <div className="py-14 text-center">
              <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Unit</th>
                      <th className="px-6 py-3 text-left">Price (Rs.)</th>
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => (
                      <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                            {p.unitType}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            defaultValue={p.price}
                            onBlur={(e) => updateProduct(p._id, "price", Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            defaultValue={p.stock}
                            onBlur={(e) => updateProduct(p._id, "stock", Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-6 py-3">
                          {p.stock <= 5 ? (
                            <span className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-medium">Low Stock</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <div key={p._id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium mt-1 inline-block">
                          {p.unitType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.stock <= 5 ? (
                          <span className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-medium">Low Stock</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium">In Stock</span>
                        )}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Price (Rs.)</label>
                        <input
                          type="number"
                          defaultValue={p.price}
                          onBlur={(e) => updateProduct(p._id, "price", Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                        <input
                          type="number"
                          defaultValue={p.stock}
                          onBlur={(e) => updateProduct(p._id, "stock", Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No products found</div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductsPage;