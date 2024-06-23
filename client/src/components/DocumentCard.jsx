import axios from "axios";
import React, { useRef, useState } from "react";
import DocumentPreviewModal from "./DocumentPreviewModal";

const DocumentCard = ({ document, onDelete }) => {
  const downloadLinkRef = useRef(null);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      onDelete(); // Call parent component's delete handler
    }
  };

  const handleDownload = async (documentId, originalname, contentType) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/documents/${documentId}/content`,
        {
          responseType: "blob", // Important for binary data
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.setAttribute("download", originalname);
        downloadLinkRef.current.click();
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (!document) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 w-64">
      <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
        {document.originalname}
      </h3>
      <p className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
        Type: {document.contentType}
      </p>
      <p className="text-sm text-gray-600">
        Size: {(document.size / 1024).toFixed(2)} KB
      </p>
      <div className="flex justify-end space-x-2 pt-5">
        <button
          className="btn-delete text-white bg-red-500 hover:bg-red-300 px-3 py-1 focus:outline-none rounded-md"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="btn-download text-white bg-blue-500 hover:bg-blue-300 px-3 py-1 focus:outline-none rounded-md"
          onClick={() =>
            handleDownload(
              document._id,
              document.originalname,
              document.contentType
            )
          }
        >
          Download
        </button>
        <a ref={downloadLinkRef} style={{ display: "none" }}>
          Download
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
