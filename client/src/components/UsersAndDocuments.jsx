import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "./Table";
import UserDocumentsModal from "./UserDocumentsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersAndDocuments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocumentsModalOpen, setUserDocumentsModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const adminToken = "your-admin-token"; // Replace with your actual admin token

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `https://document-management-system-ls7j.onrender.com/users`
        );
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  const columns = React.useMemo(
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
            >
              Show Documents
            </button>
            {row.original.isAdmin ? (
              <button
                onClick={() => handleRevokeAdmin(row.original)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded"
              >
                Revoke Admin
              </button>
            ) : (
              <button
                onClick={() => handleMakeAdmin(row.original)}
                className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
              >
                Make Admin
              </button>
            )}
            <button
              onClick={() => handleDeleteUser(row.original._id)}
              className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
            >
              Delete User
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleShowDocuments = (user) => {
    setSelectedUser(user);
    setModalUser(user);
    setUserDocumentsModalOpen(true);
  };

  const handleMakeAdmin = async (user) => {
    try {
      await axios.patch(
        `https://document-management-system-ls7j.onrender.com/users/${user._id}/make-admin`,
        null,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      toast.success(`${user.name} is now an admin.`);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isAdmin: true } : u))
      );
    } catch (error) {
      console.error("Error making user admin:", error);
      toast.error("Failed to make user an admin.");
    }
  };

  const handleRevokeAdmin = async (user) => {
    try {
      await axios.patch(
        `https://document-management-system-ls7j.onrender.com/users/${user._id}/revoke-admin`,
        null,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      toast.success(`${user.name} is no longer an admin.`);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id ? { ...u, isAdmin: false } : u
        )
      );
    } catch (error) {
      console.error("Error revoking admin status:", error);
      toast.error("Failed to revoke admin status.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(
        `https://document-management-system-ls7j.onrender.com/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="container mx-auto mt-5">
      <h1 className="text-2xl font-bold mb-5">Users and Documents</h1>
      <div className="flex justify-center">
        <div className="w-full">
          <Table columns={columns} data={users} />
        </div>
      </div>
      <UserDocumentsModal
        isOpen={userDocumentsModalOpen}
        onClose={() => setUserDocumentsModalOpen(false)}
        user={modalUser}
      />
      <ToastContainer position="top-right" />
    </div>
  );
};

export default UsersAndDocuments;
