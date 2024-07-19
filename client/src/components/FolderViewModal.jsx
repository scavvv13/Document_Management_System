import React, { useState, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";

const FolderViewModal = ({
  folder,
  documents,
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

    // Log form data
    for (let [key, value] of formData.entries()) {
    }

    try {
      const response = await axios.post(
        "http://localhost:5005/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setSelectedFile(null);
      fileInputRef.current.value = "";

      onDocumentUploaded(); // Trigger the document refresh callback
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-lg">
        <h2 className="text-2xl mb-4">Folder: {folder.name}</h2>
        <form
          onSubmit={handleFileUpload}
          className="mb-4 flex items-center gap-2"
        >
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
        <div className="flex flex-wrap gap-4">
          {documents.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={() => handleDeleteDocument(document._id)}
              onTitleClick={onTitleClick}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FolderViewModal;
