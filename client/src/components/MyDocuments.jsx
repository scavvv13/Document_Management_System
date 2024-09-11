import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import DocumentModal from "./DocumentPreviewModal";
import { UserContext } from "../UserContext";
import LoadingModal from "../components/LoadingModal"; // Import the LoadingModal component

const MyDocuments = () => {
  const { user } = useContext(UserContext);
  const [documents, setDocuments] = useState([]);
  const [folderDocuments, setFolderDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
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
      setSelectedFolder(null);
      setFolderDocuments([]);
      fetchDocuments();
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
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user._id);
    if (selectedFolder) {
      formData.append("folderId", selectedFolder._id);
    }

    try {
      await axios.post(`/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setSelectedFile(null);
      fileInputRef.current.value = "";

      if (selectedFolder) {
        fetchDocumentsByFolder(selectedFolder._id);
      } else {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    if (!newFolderName || !user) return;

    setLoadingMessage("Creating folder...");
    setIsLoading(true);

    try {
      const response = await axios.post(`/createFolder`, {
        name: newFolderName,
        userId: user._id,
      });
      setFolders((prevFolders) => [...prevFolders, response.data]);
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsLoading(false);
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
    fetchDocumentsByFolder(folder._id);
  };

  const handleCloseFolderModal = () => {
    setSelectedFolder(null);
    setFolderDocuments([]);
    fetchDocuments();
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
    <div className="container mx-auto p-6">
      <LoadingModal isLoading={isLoading} message={loadingMessage} />
      {/* Header */}
      <header className="w-full p-4 mb-6 bg-white border border-gray-300 rounded-lg shadow-md flex justify-between items-center">
        <h1 className="text-xl font-semibold">My Documents</h1>
        <div className="flex items-center gap-4">
          <form
            onSubmit={handleCreateFolder}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="border border-gray-300 p-2 rounded"
              placeholder="New Folder Name"
            />
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded"
            >
              Create Folder
            </button>
          </form>
          <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer">
            {fileInputRef.current?.files?.[0]?.name || "No file selected"}
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded"
            onClick={handleFileUpload}
            disabled={!fileInputRef.current?.files?.[0]}
          >
            Upload
          </button>
        </div>
      </header>
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        {/* Sidebar for Folders */}
        <aside className="lg:w-1/4 p-4 bg-white shadow-md rounded-lg mb-6 lg:mb-0">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <ul className="list-none space-y-2">
            {folders.map((folder) => (
              <li key={folder._id}>
                <button
                  className={`w-full text-left p-2 rounded-md ${
                    selectedFolder?._id === folder._id
                      ? "bg-gray-100 text-gray-700"
                      : "bg-white hover:bg-gray-50 text-gray-600"
                  }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  {folder.name}
                </button>
              </li>
            ))}
          </ul>
          {selectedFolder && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mt-4 w-full"
              onClick={handleDeleteFolder}
            >
              Delete Folder
            </button>
          )}
        </aside>
        {/* Main Area for Documents */}
        <main className="lg:w-3/4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(selectedFolder ? folderDocuments : documents).map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onClick={() => handleTitleClick(doc)}
                onDelete={() => handleDeleteDocument(doc._id)}
              />
            ))}
          </div>
        </main>
      </div>
      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentModal document={selectedDocument} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MyDocuments;
