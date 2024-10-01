import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import axios from "axios";
import Table from "./Table";
import UserDocumentsModal from "./UserDocumentsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../context/UserContext"; // Assuming UserContext is set up

const handleApiError = (error, message) => {
  console.error(message, error);
  toast.error(message);
};

const UsersAndDocuments = () => {
  const { user: loggedInUser } = useContext(UserContext); // Get the logged-in user's info, including isAdmin
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocumentsModalOpen, setUserDocumentsModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
            "https://document-management-system-1-0b91.onrender.com/users"
        );
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (error) {
        handleApiError(error, "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = useMemo(
      () => [
        { Header: "Name", accessor: "name" },
        { Header: "Email", accessor: "email" },
        {
          Header: "Actions",
          Cell: ({ row }) => (
              <div className="flex justify-start space-x-2">
                <button
                    onClick={() => handleShowDocuments(row.original)}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                    aria-label={`Show documents for ${row.original.name}`}
                    disabled={loading}
                >
                  Show Documents
                </button>
                {loggedInUser.isAdmin && ( // Check if the logged-in user is an admin before showing admin actions
                    <>
                      {row.original.isAdmin ? (
                          <button
                              onClick={() => handleRevokeAdmin(row.original)}
                              className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded"
                              aria-label={`Revoke admin for ${row.original.name}`}
                              disabled={loading}
                          >
                            Revoke Admin
                          </button>
                      ) : (
                          <button
                              onClick={() => handleMakeAdmin(row.original)}
                              className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
                              aria-label={`Make admin for ${row.original.name}`}
                              disabled={loading}
                          >
                            Make Admin
                          </button>
                      )}
                      <button
                          onClick={() => handleDeleteUser(row.original._id)}
                          className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                          aria-label={`Delete user ${row.original.name}`}
                          disabled={loading}
                      >
                        Delete User
                      </button>
                    </>
                )}
              </div>
          ),
        },
      ],
      [loading, loggedInUser.isAdmin]
  );

  const handleShowDocuments = useCallback((user) => {
    setSelectedUser(user);
    setModalUser(user);
    setUserDocumentsModalOpen(true);
  }, []);

  const handleMakeAdmin = useCallback(async (user) => {
    setLoading(true);
    try {
      await axios.patch(
          `https://document-management-system-1-0b91.onrender.com/users/${user._id}/make-admin`
      );
      toast.success(`${user.name} is now an admin.`);
      setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === user._id ? { ...u, isAdmin: true } : u))
      );
    } catch (error) {
      handleApiError(error, "Failed to make user an admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRevokeAdmin = useCallback(async (user) => {
    setLoading(true);
    try {
      await axios.patch(
          `https://document-management-system-1-0b91.onrender.com/users/${user._id}/revoke-admin`
      );
      toast.success(`${user.name} is no longer an admin.`);
      setUsers((prevUsers) =>
          prevUsers.map((u) =>
              u._id === user._id ? { ...u, isAdmin: false } : u
          )
      );
    } catch (error) {
      handleApiError(error, "Failed to revoke admin status.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      await axios.delete(
          `https://document-management-system-1-0b91.onrender.com/users/${userId}`
      );
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully.");
    } catch (error) {
      handleApiError(error, "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
      <div className="container mx-auto mt-5">
        <h1 className="text-2xl font-bold mb-5">Users and Documents</h1>
        <div className="flex justify-center">
          <div className="w-full">
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <Table columns={columns} data={users} />
            )}
          </div>
        </div>
        <UserDocumentsModal
            isOpen={userDocumentsModalOpen}
            onClose={() => {
              setUserDocumentsModalOpen(false);
              setModalUser(null);
            }}
            user={modalUser}
        />
        <ToastContainer position="top-right" />
      </div>
  );
};

export default UsersAndDocuments;
