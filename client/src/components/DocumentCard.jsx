import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: "https://document-management-system-1-0b91.onrender.com",
});

const DocumentCard = ({ document, onDelete, onTitleClick }) => {
  const downloadLinkRef = useRef(null);
  const [shareableLink, setShareableLink] = useState(null);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [imageError, setImageError] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await api.get(`/documents/${document._id}/signed-url`);
        setSignedImageUrl(response.data.signedUrl);
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    if (document.previewImageUrl) {
      fetchSignedUrl();
    }
  }, [document.previewImageUrl, document._id]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      onDelete();
    }
  };

  const handleDownload = async (documentId, originalname, contentType) => {
    try {
      const response = await api.get(`/documents/${documentId}/content`, {
        responseType: "blob",
      });

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

  const handleShare = async (documentId, email) => {
    try {
      const response = await api.post(`/documents/${documentId}/share`, {
        email,
      });
      setShareableLink(response.data.message);
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
    setEmail("");
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    handleShare(document._id, email);
    closeSharePopup();
  };

  if (!document) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-2 m-1 w-60 flex flex-col">
      {imageError || !signedImageUrl ? (
        <div className="h-32 w-full flex items-center justify-center bg-gray-200 rounded mb-1">
          <span className="text-gray-500 text-sm">No Preview Available</span>
        </div>
      ) : (
        <img
          src={signedImageUrl}
          alt={`${document.originalname} preview`}
          className="h-32 w-full object-cover rounded mb-1"
          onError={() => setImageError(true)} // Set image error if loading fails
        />
      )}
      <h3
        className="text-md font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
        onClick={() => onTitleClick(document)}
        aria-label={`Open document: ${document.originalname}`}
      >
        {document.originalname}
      </h3>
      <p className="text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
        Type: {document.contentType}
      </p>
      <p className="text-xs text-gray-600">
        Size: {(document.size / 1024).toFixed(2)} KB
      </p>
      <div className="flex-grow"></div>
      <div className="flex flex-wrap justify-end gap-1 mt-2">
        <button
          className="btn-delete text-white bg-red-500 hover:bg-red-600 px-2 py-1 text-xs rounded-md focus:outline-none"
          onClick={handleDelete}
          aria-label="Delete document"
        >
          Delete
        </button>
        <button
          className="btn-download text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 text-xs rounded-md focus:outline-none"
          onClick={() =>
            handleDownload(
              document._id,
              document.originalname,
              document.contentType
            )
          }
          aria-label="Download document"
        >
          Download
        </button>
        <button
          className="btn-share text-white bg-green-500 hover:bg-green-600 px-2 py-1 text-xs rounded-md focus:outline-none"
          onClick={openSharePopup}
          aria-label="Share document"
        >
          Share
        </button>
        <a ref={downloadLinkRef} style={{ display: "none" }}>
          Download
        </a>
      </div>
      {isSharePopupOpen && (
        <div className="share-popup bg-white p-4 rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <form onSubmit={handleShareSubmit}>
            <label className="block text-sm font-semibold mb-2">
              Enter email to share with:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full mb-2"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeSharePopup}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Share
              </button>
            </div>
          </form>
        </div>
      )}
      {shareableLink && (
        <p className="text-xs text-gray-600 mt-1">{shareableLink}</p>
      )}
    </div>
  );
};

export default DocumentCard;
