import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    unitType: "",
    price: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load products
  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search & filter
  useEffect(() => {
    let filtered = [...products];
    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (filterUnit) {
      filtered = filtered.filter((p) => p.unitType === filterUnit);
    }
    setFilteredProducts(filtered);
  }, [search, filterUnit, products]);

  // Add new product
  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.unitType) {
      alert("Name and Unit Type are required!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/products", newProduct);
      alert("Product added successfully ✅");
      setNewProduct({ name: "", unitType: "", price: 0, stock: 0 });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  // Update price or stock
  const updateProduct = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, {
        [field]: value,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    }
  };

  // Delete product
 const handleDelete = async (id) => {
   if (!window.confirm("Are you sure you want to delete this product?")) return;

   try {
     await axios.delete(`http://localhost:5000/api/products/${id}`);
     alert("Product deleted successfully");

     // Remove from frontend state
     setProducts(products.filter((p) => p._id !== id));
   } catch (err) {
     alert(err.response?.data?.message || "Error deleting product");
   }
 };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Product Inventory Dashboard</h2>

      {/* Search & Filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10, padding: 5 }}
        />
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          style={{ padding: 5 }}
        >
          <option value="">All Units</option>
          <option value="Nos">Nos</option>
          <option value="Meter">Meter</option>
        </select>
      </div>

      {/* Add New Product */}
      <div
        style={{
          marginBottom: 20,
          border: "1px solid #ddd",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <h3>Add New Product</h3>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          style={{ marginRight: 5, padding: 4 }}
        />
        <select
          value={newProduct.unitType}
          onChange={(e) =>
            setNewProduct({ ...newProduct, unitType: e.target.value })
          }
          style={{ marginRight: 5, padding: 4 }}
        >
          <option value="">Select Unit</option>
          <option value="Nos">Nos</option>
          <option value="Meter">Meter</option>
        </select>
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
          style={{ marginRight: 5, padding: 4 }}
        />
        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: Number(e.target.value) })
          }
          style={{ marginRight: 5, padding: 4 }}
        />
        <button onClick={saveProduct} disabled={loading}>
          {loading ? "Saving..." : "Add Product"}
        </button>
      </div>

      {/* Products Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>Name</th>
            <th style={th}>Unit</th>
            <th style={th}>Price</th>
            <th style={th}>Stock</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p._id}>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.unitType}</td>
              <td style={td}>
                <input
                  type="number"
                  value={p.price}
                  onChange={(e) =>
                    updateProduct(p._id, "price", Number(e.target.value))
                  }
                  style={{ width: 80 }}
                />
              </td>
              <td style={td}>
                <input
                  type="number"
                  value={p.stock}
                  onChange={(e) =>
                    updateProduct(p._id, "stock", Number(e.target.value))
                  }
                  style={{ width: 80 }}
                />
              </td>
              <td style={td}>
                <button
                  onClick={() => handleDelete(p._id)}
                  style={{ color: "red" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td style={td} colSpan={5}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const th = { padding: 8, borderBottom: "2px solid #ccc", textAlign: "left" };
const td = { padding: 6, borderBottom: "1px solid #eee" };

export default ProductsPage;
