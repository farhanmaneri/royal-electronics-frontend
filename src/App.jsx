import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SalesPage from "./pages/SalesPage";
import PurchasePage from "./pages/PurchasePage";
import ProductsPage from "./pages/ProductsPage";

function App() {
  return (
   <Router>
  <Routes>
      <Route path="/" element={<SalesPage />} />
      <Route path="/purchase" element={<PurchasePage />} />
      <Route path="/products" element={<ProductsPage />} />
  </Routes>
</Router>
  );
}

export default App;
