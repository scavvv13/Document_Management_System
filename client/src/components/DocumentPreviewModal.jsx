import React from "react";

const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) {
    return null;
  }

  // Function to render sharedWith users' emails
  const renderSharedWith = () => {
    if (document.sharedWith.length === 0) {
      return (
        <p>
          <strong>Shared With:</strong> No one
        </p>
      );
    } else {
      return (
        <div>
          <strong>Shared With:</strong>
          <ul>
            {document.sharedWith.map((user) => (
              <li key={user._id}>{user.email}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4">{document.originalname}</h2>
        <p>
          <strong>Filename:</strong> {document.filename}
        </p>
        <p>
          <strong>Content Type:</strong> {document.contentType}
        </p>
        <p>
          <strong>Size:</strong> {(document.size / 1024).toFixed(2)} KB
        </p>
        <p>
          <strong>Path:</strong> {document.path}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(document.createdAt).toLocaleString()}
        </p>
        {renderSharedWith()}
        <button
          onClick={onClose}
          className="bg-red-500 text-white p-2 rounded mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
