import React, { useState, useEffect } from "react";
import axios from "axios";

const UserDocumentsModal = ({ isOpen, onClose, user }) => {
  const [userDocuments, setUserDocuments] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDocuments(user._id);
    }
  }, [isOpen, user]);

  const fetchUserDocuments = async (userId) => {
    try {
      const response = await axios.get(`/documents?userId=${userId}`);
      setUserDocuments(response.data);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      setUserDocuments([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-4 rounded-md shadow-lg max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {user ? `${user.name}'s Documents` : "User Documents"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-96">
          {userDocuments.length > 0 ? (
            <ul>
              {userDocuments.map((doc) => (
                <li key={doc._id}>
                  <h3 className="font-bold">{doc.originalname}</h3>
                  <p>
                    Time Uploaded: {new Date(doc.createdAt).toLocaleString()}
                  </p>
                  <p>Description: {doc.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents found for {user?.name}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDocumentsModal;
