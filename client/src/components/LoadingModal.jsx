import React from "react";

const LoadingModal = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg flex items-center">
        <div className="w-6 h-6 border-t-4 border-blue-500 border-solid border-r-transparent rounded-full animate-spin"></div>
        <span className="ml-4">Uploading...</span>
      </div>
    </div>
  );
};

export default LoadingModal;
