import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";

const FolderViewModal = ({
  folder,
  documents = [], // Default to an empty array if documents is not provided
  onClose,
  onTitleClick,
  onDocumentUploaded,
}) => {
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
    formData.append("userId", folder.userId); // Ensure userId is appended
    formData.append("folderId", folder._id);

    try {
      await axios.post(`/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setSelectedFile(null);
      fileInputRef.current.value = "";

      onDocumentUploaded(); // Trigger the document refresh callback
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Folder: {folder.name}</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 text-xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form
          onSubmit={handleFileUpload}
          className="mb-4 flex items-center gap-2"
        >
          <label className="bg-gray-200 hover:bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-pointer">
            {fileInputRef.current?.files?.[0]?.name || "No file selected"}
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length > 0 ? (
            documents.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onDelete={() => handleDeleteDocument(document._id)}
                onTitleClick={onTitleClick}
              />
            ))
          ) : (
            <p>No documents available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderViewModal;
