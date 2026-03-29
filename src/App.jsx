import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SalesPage from "./pages/SalesPage";
import PurchasePage from "./pages/PurchasePage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — must be logged in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <Navbar />
              <PurchasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProductsPage />
            </ProtectedRoute>
          }
        />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
