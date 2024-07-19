import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import DocumentModal from "./DocumentPreviewModal";
import { UserContext } from "../UserContext";
import FolderViewModal from "../components/FolderViewModal";

const MyDocuments = () => {
  const { user } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [folderDocuments, setFolderDocuments] = useState([]); // State for folder documents
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState(""); // State for new folder name
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchFolders();
    }
  }, [user]);

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

  const fetchFolders = async () => {
    try {
      const response = await axios.get("http://localhost:5005/folders", {
        params: { userId: user._id },
      });
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchDocumentsByFolder = async (folderId) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/folders/${folderId}/documents`
      );
      setFolderDocuments(response.data); // Set folder documents
    } catch (error) {
      console.error("Error fetching documents by folder:", error);
    }
  };

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
    if (selectedFolder) {
      formData.append("folderId", selectedFolder._id); // Append folderId if a folder is selected
    }

    try {
      await axios.post("http://localhost:5005/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setSelectedFile(null);
      fileInputRef.current.value = "";

      if (selectedFolder) {
        fetchDocumentsByFolder(selectedFolder._id); // Refresh folder documents if inside a folder
      } else {
        fetchDocuments(); // Refresh all documents
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    if (!newFolderName || !user) return;

    try {
      const response = await axios.post("http://localhost:5005/createFolder", {
        name: newFolderName,
        userId: user._id, // Include userId in the request body
      });
      setFolders((prevFolders) => [...prevFolders, response.data]);
      setNewFolderName(""); // Clear the folder name input
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleTitleClick = (document) => {
    setSelectedDocument(document);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    fetchDocumentsByFolder(folder._id); // Fetch documents within the selected folder
  };

  const handleCloseFolderModal = () => {
    setSelectedFolder(null);
    setFolderDocuments([]); // Clear folder documents when the modal is closed
    fetchDocuments(); // Refresh all documents when the folder modal is closed
  };

  const handleDocumentUploaded = () => {
    if (selectedFolder) {
      fetchDocumentsByFolder(selectedFolder._id);
    } else {
      fetchDocuments();
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
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
      <form
        onSubmit={handleCreateFolder}
        className="mb-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="border border-gray-300 p-2 rounded mb-2 flex-grow"
          placeholder="New Folder Name"
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Create Folder
        </button>
      </form>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          {folders.map((folder) => (
            <div
              key={folder._id}
              onClick={() => handleFolderClick(folder)}
              className="p-4 border rounded-lg shadow-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
            >
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 4a2 2 0 012-2h4.586A2 2 0 0110 3.414l1.414 1.414A2 2 0 0112 6.586V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
                </svg>
                <span className="font-semibold">{folder.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="w-3/4 pl-4">
          <h2 className="text-lg font-semibold mb-2">Documents</h2>
          <div className="flex flex-wrap gap-4">
            {!selectedFolder &&
              documents.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  onDelete={() => handleDeleteDocument(document._id)}
                  onTitleClick={handleTitleClick}
                />
              ))}
          </div>
        </div>
      </div>
      <DocumentModal document={selectedDocument} onClose={handleCloseModal} />
      {selectedFolder && (
        <FolderViewModal
          folder={selectedFolder}
          documents={folderDocuments} // Pass folder documents to the modal
          onClose={handleCloseFolderModal}
          onTitleClick={handleTitleClick}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
};

export default MyDocuments;
