import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import DocumentModal from "./DocumentPreviewModal";
import { UserContext } from "../UserContext";
import LoadingModal from "../components/LoadingModal";

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
        fetchDocumentsByFolder(selectedFolder._id);
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
    <div className="container mx-auto p-6 md:p-8 lg:p-10">
      <LoadingModal isLoading={isLoading} message={loadingMessage} />
      <header className="w-full p-4 mb-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-semibold pl-4">My Documents</h1>
        <div className="flex items-center gap-3">
          <form
            onSubmit={handleCreateFolder}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="New Folder Name"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition"
            >
              Create
            </button>
          </form>
          <div className="flex items-center gap-3">
            <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md cursor-pointer transition">
              {fileInputRef.current?.files?.[0]?.name || "No file selected"}
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </label>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition"
              onClick={handleFileUpload}
              disabled={!fileInputRef.current?.files?.[0]}
            >
              Upload
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <aside className="lg:w-1/4 p-4 bg-white shadow-md rounded-md mb-4 lg:mb-0">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <ul className="space-y-4">
            {folders.map((folder) => (
              <li key={folder._id}>
                <button
                  className={`w-full text-left p-2 rounded-md ${
                    selectedFolder?._id === folder._id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  {folder.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(selectedFolder ? folderDocuments : documents).map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onTitleClick={() => handleTitleClick(doc)}
                onDelete={() => handleDeleteDocument(doc._id)}
              />
            ))}
          </div>
        </main>
      </div>
      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={handleCloseModal}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
      {selectedFolder && (
        <div className="fixed top-0 left-0 z-50 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {selectedFolder.name} - Documents
            </h2>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md mb-4"
              onClick={handleDeleteFolder}
            >
              Delete Folder
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
              onClick={handleCloseFolderModal}
            >
              Close
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {folderDocuments.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onTitleClick={() => handleTitleClick(doc)}
                  onDelete={() => handleDeleteDocument(doc._id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
