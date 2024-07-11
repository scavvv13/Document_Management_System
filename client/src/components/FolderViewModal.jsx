import React, { useState, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";

const FolderViewModal = ({ folder, documents, onClose, onTitleClick }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !folder) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folderId", folder._id); // Append folderId for the upload

    try {
      await axios.post("http://localhost:5005/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setSelectedFile(null);
      fileInputRef.current.value = "";

      // Optionally, you may want to refresh the documents list in the modal
      // Example: fetchDocumentsByFolder(folder._id);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5005/documents/${documentId}`);

      // Optionally, you may want to refresh the documents list in the modal
      // Example: fetchDocumentsByFolder(folder._id);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-pink-500 hover:text-pink-700"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4">{folder.name}</h2>

        {/* Display documents */}
        <div className="mb-4">
          {documents.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={() => handleDeleteDocument(document._id)}
              onTitleClick={() => onTitleClick(document)}
            />
          ))}
        </div>

        {/* File upload form */}
        <form onSubmit={handleFileUpload} className="flex items-center gap-2">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="border border-gray-300 p-2 rounded mb-2 flex-grow"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default FolderViewModal;
