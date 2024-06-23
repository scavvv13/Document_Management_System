import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";

const UsersAndDocuments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const adminToken = "your-admin-token"; // Replace with the actual admin token
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [adminStatusNotification, setAdminStatusNotification] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5005/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Function to handle clicks outside the menu
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
        setSelectedUserId(null);
      }
    };

    // Add event listener when the menu is visible
    if (showActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionsMenu]);

  const handleDeleteDocument = async (userId, documentId) => {
    try {
      await axios.delete(`http://localhost:5005/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Update state to reflect immediate deletion
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                documents: user.documents.filter(
                  (doc) => doc._id !== documentId
                ),
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5005/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Update state to reflect immediate deletion
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      const response = await axios.put(
        `http://localhost:5005/users/${userId}`,
        { isAdmin: !isAdmin }
      );

      // Update state to reflect isAdmin change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isAdmin: response.data.isAdmin }
            : user
        )
      );

      // Show admin status notification
      setAdminStatusNotification(
        `${response.data.name} is now ${
          response.data.isAdmin ? "an admin." : "no longer an admin."
        }`
      );

      // Clear notification after 3 seconds
      setTimeout(() => {
        setAdminStatusNotification(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleShowActionsMenu = (userId) => {
    setSelectedUserId(userId);
    setShowActionsMenu(true);
  };

  const handleCloseActionsMenu = () => {
    setShowActionsMenu(false);
    setSelectedUserId(null);
  };

  return (
    <div className="flex flex-wrap justify-center">
      {users.map((user) => (
        <div
          key={user._id}
          className="m-4 p-4 border rounded-lg shadow-md relative"
        >
          <h2 className="text-lg font-semibold mb-2">{user.name}</h2>
          <p className="text-gray-600 mb-2">{user.email}</p>
          <h3 className="text-md font-semibold mb-2">Documents:</h3>
          <div className="grid gap-4">
            {user.documents.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onDelete={() => handleDeleteDocument(user._id, document._id)}
              />
            ))}
          </div>
          <div className="absolute top-2 right-2">
            <button
              className="focus:outline-none"
              onClick={() => handleShowActionsMenu(user._id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
            {showActionsMenu && selectedUserId === user._id && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 rounded-md bg-white ring-1 ring-black ring-opacity-5"
              >
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    onClick={() => {
                      handleToggleAdmin(user._id, user.isAdmin);
                      handleCloseActionsMenu();
                    }}
                  >
                    {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900 w-full text-left"
                    onClick={() => {
                      handleDeleteUser(user._id);
                      handleCloseActionsMenu();
                    }}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {adminStatusNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md">
          {adminStatusNotification}
        </div>
      )}
    </div>
  );
};

export default UsersAndDocuments;
