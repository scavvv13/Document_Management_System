import React, { useEffect, useState } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";

const UsersAndDocuments = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5005/users"); // Replace with your backend API endpoint
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-wrap justify-center">
      {users.map((user) => (
        <div key={user._id} className="m-4 p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">{user.name}</h2>
          <p className="text-gray-600 mb-2">{user.email}</p>
          <h3 className="text-md font-semibold mb-2">Documents:</h3>
          <div className="grid gap-4">
            {user.documents.map((document) => (
              <DocumentCard key={document._id} document={document} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersAndDocuments;
