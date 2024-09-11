import React from "react";

const LoadingModal = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl flex flex-col items-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-t-4 border-blue-500 border-solid border-r-transparent rounded-full animate-spin"></div>
        {/* Message */}
        <span className="mt-4 text-lg font-medium text-gray-800">
          {message}
        </span>
      </div>
    </div>
  );
};

export default LoadingModal;
