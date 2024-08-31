import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import DocumentModal from "./DocumentPreviewModal";
import { UserContext } from "../UserContext";
import FolderModal from "../components/FolderViewModal";
import LoadingModal from "../components/LoadingModal"; // Import the LoadingModal component

const MyDocuments = () => {
  const { user } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [folderDocuments, setFolderDocuments] = useState([]); // State for folder documents
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState(""); // State for new folder name
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchFolders();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`http://localhost:5006/documents`, {
        params: { userId: user._id },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`http://localhost:5006/folders`, {
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
        `http://localhost:5006/folders/${folderId}/documents`
      );
      setFolderDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents by folder:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5006/documents/${documentId}`);
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== documentId)
      );
      if (selectedFolder) {
        fetchDocumentsByFolder(selectedFolder._id); // Refresh folder documents if inside a folder
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !user) return;

    setIsLoading(true); // Show loading modal

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user._id);
    if (selectedFolder) {
      formData.append("folderId", selectedFolder._id); // Append folderId if a folder is selected
    }

    try {
      await axios.post(`http://localhost:5006/upload`, formData, {
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
    } finally {
      setIsLoading(false); // Hide loading modal
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    if (!newFolderName || !user) return;

    try {
      const response = await axios.post(`http://localhost:5006/createFolder`, {
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <LoadingModal isLoading={isLoading} />{" "}
      {/* Add the LoadingModal component */}
      {/* Header */}
      <header className="w-full p-4 mb-4 bg-white border border-gray-250 rounded-full shadow-md shadow-gray-400 flex justify-between items-center">
        <h1 className="text-xl font-bold pl-6">My Documents</h1>
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleCreateFolder}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="border border-gray-300 p-2 rounded flex-grow"
              placeholder="New Folder Name"
              style={{ width: "200px" }}
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Folder
            </button>
          </form>
          <div className="flex items-center gap-2 pr-7">
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleFileUpload}
              disabled={!fileInputRef.current?.files?.[0]}
            >
              Upload
            </button>
          </div>
        </div>
      </header>
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        {/* Sidebar for Folders */}
        <div className="lg:w-1/4 p-4 bg-white shadow-md rounded mb-4 lg:mb-0">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <ul className="list-none space-y-4">
            {folders.map((folder) => (
              <li key={folder._id}>
                <div
                  onClick={() => handleFolderClick(folder)}
                  className="bg-gray-100 border border-gray-200 rounded p-4 cursor-pointer hover:bg-gray-200 transition"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6 text-amber-500 mr-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h10.44a1.5 1.5 0 0 0 1.061-.44l2.12-2.12M21.75 6v12"
                      />
                    </svg>
                    <span className="text-lg font-medium">{folder.name}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Documents Area */}
        <div className="lg:w-3/4 p-4">
          {selectedFolder ? (
            <>
              <h2 className="text-lg font-semibold mb-4">
                Documents in {selectedFolder.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folderDocuments.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onClick={() => handleTitleClick(doc)}
                    onDelete={() => handleDeleteDocument(doc._id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">All Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onTitleClick={() => handleTitleClick(doc)}
                    onDelete={() => handleDeleteDocument(doc._id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Document Modal */}
      {selectedDocument && (
        <DocumentModal document={selectedDocument} onClose={handleCloseModal} />
      )}
      {/* Folder Modal */}
      {selectedFolder && (
        <FolderModal
          folder={selectedFolder}
          onClose={handleCloseFolderModal}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
};

export default MyDocuments;
