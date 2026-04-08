const BackendLoader = ({ attempt }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-2">
          👑 Royal Electronics
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Connecting to server, please wait...
        </p>

        {/* Attempt counter */}
        <div className="bg-blue-50 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-600 font-medium">
            {attempt <= 2
              ? "⚡ Starting up server..."
              : attempt <= 5
              ? "⏳ Server is waking up, almost ready..."
              : "🔄 Taking longer than usual, still trying..."}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                style={{ animationDelay: `${dot * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Free server may take 10–30 seconds on first load
        </p>
      </div>
    </div>
  );
};

export default BackendLoader;