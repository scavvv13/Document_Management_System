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
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchFolders();
    }
  }, [user]);

  const fetchData = async (url, params, setData) => {
    try {
      setLoadingMessage("Loading...");
      setIsLoading(true);
      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Could not load data. Please try again later.");
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
    if (!selectedFolder || !window.confirm("Are you sure you want to delete this folder?"))
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
      setData((prev) => prev.filter((item) => item._id !== url.split("/").pop()));
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
      fetchDocuments();
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
    return <div className="text-center">Loading...</div>;
  }

  return (
      <div className="container mx-auto p-4">
        <LoadingModal isLoading={isLoading} message={loadingMessage} />
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <header className="navbar bg-base-100 shadow-lg mb-4">
          <h1 className="text-xl font-bold ml-3 mr-9">My Documents</h1>
          <div className="flex justify-end">
            <form onSubmit={handleCreateFolder} className="flex items-center">
              <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="input input-bordered mr-2"
                  placeholder="New Folder Name"
              />
              <button type="submit" className="btn btn-success">
                Create Folder
              </button>
            </form>
            <div className="ml-4">
              <label className="btn btn-secondary">
                {fileInputRef.current?.files?.[0]?.name || "Select File"}
                <input
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                />
              </label>
              <button
                  className="btn btn-primary ml-2"
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
              >
                Upload
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold">Folders</h2>
            <ul className="menu bg-base-200 p-2 rounded-box">
              {folders.map((folder) => (
                  <li key={folder._id}>
                    <button
                        className={`${
                            selectedFolder?._id === folder._id ? "bg-primary text-white" : ""
                        }`}
                        onClick={() => handleFolderClick(folder)}
                    >
                      {folder.name}
                    </button>
                  </li>
              ))}
            </ul>
            {selectedFolder && (
                <button className="btn btn-error mt-4" onClick={handleDeleteFolder}>
                  Delete Folder
                </button>
            )}
          </div>

          <div className="lg:col-span-3">
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
