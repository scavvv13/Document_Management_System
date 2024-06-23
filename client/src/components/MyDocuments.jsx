import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import { UserContext } from "../UserContext";

const MyDocuments = () => {
  const { user } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const fetchDocuments = async () => {
        try {
          const response = await axios.get("http://localhost:5005/documents", {
            params: { userId: user._id },
          });
          setDocuments(response.data);
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      };

      fetchDocuments();
    }
  }, [user]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5005/documents/${documentId}`);
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== documentId)
      );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !user) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user._id);

    try {
      await axios.post("http://localhost:5005/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setSelectedFile(null);
      fileInputRef.current.value = "";

      const response = await axios.get("http://localhost:5005/documents", {
        params: { userId: user._id },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleFileUpload} className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="border border-gray-300 p-2 rounded mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </form>
      <div className="flex flex-wrap">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={() => handleDeleteDocument(document._id)} // Pass the onDelete handler
          />
        ))}
      </div>
    </div>
  );
};

export default MyDocuments;
