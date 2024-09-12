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
  const [selectedFolder, setSelectedFolder] = useState(null); // State for selected folder
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState(""); // State for new folder name
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [loadingMessage, setLoadingMessage] = useState(""); // State for dynamic loading message
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchFolders();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoadingMessage("Loading documents...");
      setIsLoading(true);
      const response = await axios.get(`/documents`, {
        params: { userId: user._id },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      setLoadingMessage("Loading folders...");
      setIsLoading(true);
      const response = await axios.get(`/folders`, {
        params: { userId: user._id },
      });
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentsByFolder = async (folderId) => {
    try {
      setLoadingMessage("Loading folder documents...");
      setIsLoading(true);
      const response = await axios.get(`/folders/${folderId}/documents`);
      setFolderDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents by folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      setLoadingMessage("Deleting document...");
      setIsLoading(true);
      await axios.delete(`/documents/${documentId}`);
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== documentId)
      );
      if (selectedFolder) {
        fetchDocumentsByFolder(selectedFolder._id); // Refresh folder documents if inside a folder
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    try {
      setLoadingMessage("Deleting folder...");
      setIsLoading(true);
      await axios.delete(`/folders/${selectedFolder._id}`);
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder._id !== selectedFolder._id)
      );
      setSelectedFolder(null); // Reset selected folder
      setFolderDocuments([]); // Clear folder documents
      fetchDocuments(); // Refresh all documents
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !user) return;

    setLoadingMessage("Uploading file...");
    setIsLoading(true); // Show loading modal

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user._id);
    if (selectedFolder) {
      formData.append("folderId", selectedFolder._id); // Append folderId if a folder is selected
    }

    try {
      await axios.post(
        `https://document-management-system-1-0b91.onrender.com/upload`,
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

    setLoadingMessage("Creating folder...");
    setIsLoading(true); // Show loading modal

    try {
      const response = await axios.post(
        `https://document-management-system-1-0b91.onrender.com/createFolder`,
        {
          name: newFolderName,
          userId: user._id, // Include userId in the request body
        }
      );
      setFolders((prevFolders) => [...prevFolders, response.data]);
      setNewFolderName(""); // Clear the folder name input
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsLoading(false); // Hide loading modal
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
      <LoadingModal isLoading={isLoading} message={loadingMessage} />{" "}
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
                <button
                  className={`block w-full p-2 rounded-lg text-left focus:outline-none ${
                    selectedFolder?._id === folder._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  {folder.name}
                </button>
              </li>
            ))}
          </ul>
          {/* Delete Folder button */}
          {selectedFolder && (
            <div className="mt-4">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeleteFolder}
              >
                Delete Folder
              </button>
            </div>
          )}
        </div>

        {/* Main Area for Documents */}
        <div className="lg:w-3/4 p-4 bg-white shadow-md rounded">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(selectedFolder ? folderDocuments : documents).map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onClick={() => handleTitleClick(document)}
                onDelete={() => handleDeleteDocument(document._id)}
              />
            ))}
          </div>
        </div>
      </div>
      {selectedDocument && (
        <DocumentModal document={selectedDocument} onClose={handleCloseModal} />
      )}
      {/* Folder Modal */}
      {/* {selectedFolder && (
        // <FolderModal
        //   folder={selectedFolder}
        //   onClose={handleCloseFolderModal}
        //   onDocumentUploaded={handleDocumentUploaded}
        // />
      )} */}
    </div>
  );
};

export default MyDocuments;
