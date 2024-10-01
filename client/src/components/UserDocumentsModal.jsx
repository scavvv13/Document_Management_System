import React, { useState, useEffect } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import { toast } from "react-toastify";

const UserDocumentsModal = ({ isOpen, onClose, user }) => {
  const [userDocuments, setUserDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDocuments(user._id);
    } else {
      setUserDocuments([]); // Clear documents when modal is closed
    }
  }, [isOpen, user]);

  const fetchUserDocuments = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/documents?userId=${userId}`);
      setUserDocuments(response.data);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      setUserDocuments([]);
      toast.error("Failed to fetch user documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (userId, documentId) => {
    try {
      await axios.delete(`/documents/${documentId}`);
      fetchUserDocuments(userId); // Refresh the document list
      toast.success("Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document.");
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-75">
        <div className="modal-box w-full max-w-3xl p-6">
          <div className="modal-header flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              {user ? `${user.name}'s Documents` : "User Documents"}
            </h2>
            <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-outline text-gray-500 hover:bg-gray-100"
                aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="modal-body overflow-y-auto max-h-96">
            {loading ? (
                <div className="flex justify-center items-center">
                  <button className="btn btn-ghost loading">Loading...</button>
                </div>
            ) : userDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDocuments.map((doc) => (
                      <DocumentCard
                          key={doc._id}
                          document={doc}
                          onDelete={() => handleDeleteDocument(user._id, doc._id)}
                      />
                  ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No documents found for {user?.name}.</p>
            )}
          </div>
          <div className="modal-footer flex justify-end mt-4">
            <button
                onClick={onClose}
                className="btn btn-outline btn-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  );
};

export default UserDocumentsModal;
