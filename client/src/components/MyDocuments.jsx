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
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchFolders();
    }
  }, [user]);

  const fetchData = async (url, params, setData) => {
    try {
      setLoadingMessage(`Loading...`);
      setIsLoading(true);
      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Could not load data. Please try again later."); // Set error message
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = () => {
    fetchData(`/documents`, { userId: user._id }, setDocuments);
  };

  const fetchFolders = () => {
    fetchData(`/folders`, { userId: user._id }, setFolders);
  };

  const fetchDocumentsByFolder = (folderId) => {
    fetchData(`/folders/${folderId}/documents`, {}, setFolderDocuments);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    await deleteEntity(`/documents/${documentId}`, setDocuments, "document");
  };

  const handleDeleteFolder = async () => {
    if (
      !selectedFolder ||
      !window.confirm("Are you sure you want to delete this folder?")
    )
      return;
    await deleteEntity(`/folders/${selectedFolder._id}`, setFolders, "folder");
    setSelectedFolder(null);
    setFolderDocuments([]);
  };

  const deleteEntity = async (url, setData, entity) => {
    try {
      setLoadingMessage(`Deleting ${entity}...`);
      setIsLoading(true);
      await axios.delete(url);
      setData((prev) =>
        prev.filter((item) => item._id !== url.split("/").pop())
      );
    } catch (error) {
      console.error(`Error deleting ${entity}:`, error);
      setErrorMessage(`Could not delete ${entity}. Please try again.`);
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
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSelectedFile(null);
      fileInputRef.current.value = "";
      fetchDocuments(); // Refresh documents
      if (selectedFolder) {
        fetchDocumentsByFolder(selectedFolder._id);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("Could not upload file. Please try again.");
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
      setFolders((prev) => [...prev, response.data]);
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
      setErrorMessage("Could not create folder. Please try again.");
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <LoadingModal isLoading={isLoading} message={loadingMessage} />
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}{" "}
      {/* Display error message */}
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
              disabled={!selectedFile}
            >
              Upload
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row lg:space-x-4">
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
    </div>
  );
};

export default MyDocuments;
