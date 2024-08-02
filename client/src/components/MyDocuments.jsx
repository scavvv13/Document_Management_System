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
      const response = await axios.get(
        `https://document-management-system-ls7j.onrender.com/documents`,
        {
          params: { userId: user._id },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get(
        `https://document-management-system-ls7j.onrender.com/folders`,
        {
          params: { userId: user._id },
        }
      );
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchDocumentsByFolder = async (folderId) => {
    try {
      const response = await axios.get(
        `https://document-management-system-ls7j.onrender.com/folders/${folderId}/documents`
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
      await axios.delete(
        `https://document-management-system-ls7j.onrender.com/documents/${documentId}`
      );
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
      await axios.post(
        `https://document-management-system-ls7j.onrender.com/upload`,
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
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    if (!newFolderName || !user) return;

    try {
      const response = await axios.post(
        `https://document-management-system-ls7j.onrender.com/createFolder`,
        {
          name: newFolderName,
          userId: user._id, // Include userId in the request body
        }
      );
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
      <div className="flex flex-wrap -mx-4">
        {/* Header */}
        <header className="w-full p-4 mb-4 bg-white shadow-md rounded flex justify-between items-center">
          <h1 className="text-xl font-bold">My Documents</h1>
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
            <div className="flex items-center gap-2">
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

        {/* Sidebar for Folders */}
        <aside className="w-full md:w-1/5 p-4 bg-white shadow-md rounded mb-4 md:mb-0 md:sticky md:top-4">
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
                      className=" size-6 text-amber-500 mr-6 fill-yellow-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                      />
                    </svg>

                    <div>
                      <span className="font-medium">{folder.name}</span>
                      <span className="text-gray-600 text-sm block">
                        {folder.description}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content for Documents */}
        <main className="w-full md:w-4/5 p-4 bg-white shadow-md rounded">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </main>
      </div>
      <DocumentModal document={selectedDocument} onClose={handleCloseModal} />
      {selectedFolder && (
        <FolderViewModal
          folder={selectedFolder}
          documents={folderDocuments}
          onClose={handleCloseFolderModal}
          onTitleClick={handleTitleClick}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
};

export default MyDocuments;
