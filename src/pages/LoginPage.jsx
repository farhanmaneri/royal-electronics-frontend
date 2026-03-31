import { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERNAME = import.meta.env.VITE_APP_USERNAME;
const PASSWORD = import.meta.env.VITE_APP_PASSWORD;
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log("ENV USERNAME:", import.meta.env.VITE_APP_USERNAME);
    console.log("ENV PASSWORD:", import.meta.env.VITE_APP_PASSWORD);
    console.log("TYPED USERNAME:", username);
    console.log("TYPED PASSWORD:", password);
      if (username === USERNAME && password === PASSWORD) {
       
        localStorage.setItem("isLoggedIn", "true");
        navigate("/");
      } else {
        setError("Invalid username or password!");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen  from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👑</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Royal Electronics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 text-center">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition text-sm mt-2"
          >
            {loading ? "Signing in..." : "Sign In 🔐"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Royal Electronics Management System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
