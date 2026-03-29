import { useState } from "react";
import { Link, useNavigate, useLocation }  from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "💰 Sales" },
    { to: "/purchase", label: "🛒 Purchase" },
    { to: "/products", label: "📦 Products" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="text-white font-bold text-lg">
          👑 Royal Electronics
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                isActive(link.to)
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-blue-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logout - Desktop */}
        <div className="hidden md:block">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl text-sm transition"
          >
            Logout 🚪
          </button>
        </div>

        {/* Hamburger - Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white focus:outline-none text-2xl"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive(link.to)
                  ? "bg-white text-blue-600"
                  : "text-white hover:bg-blue-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-white text-blue-600 font-semibold rounded-xl text-sm transition mt-2"
          >
            Logout 🚪
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;