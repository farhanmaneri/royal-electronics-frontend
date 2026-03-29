import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 */}
        <div className="text-8xl md:text-9xl font-black text-blue-100 select-none">
          404
        </div>

        <div className="mt-4 mb-2 text-4xl">😕</div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold rounded-xl transition text-sm"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
