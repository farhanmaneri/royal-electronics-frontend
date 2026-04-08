import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SalesPage from "./pages/SalesPage";
import PurchasePage from "./pages/PurchasePage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";  // ✅ this was missing
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BackendLoader from "./components/BackendLoader";
import useBackendReady from "./hooks/useBackendReady";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const { isReady, attempt } = useBackendReady();

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/ping`).catch(() => {});
    }, 9 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isReady) return <BackendLoader attempt={attempt} />;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <SalesPage />
          </ProtectedRoute>
        } />
        <Route path="/purchase" element={
          <ProtectedRoute>
            <Navbar />
            <PurchasePage />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <Navbar />
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;