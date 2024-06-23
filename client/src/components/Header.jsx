import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchResultsModal from "./SearchResultsModal"; // Importing the modal component
import UserDocumentsModal from "./UserDocumentsModal"; // Importing the user documents modal component
import { UserContext } from "../UserContext";

export default function Header() {
  const { user } = useContext(UserContext); // Access user from UserContext

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDocumentsModalOpen, setIsUserDocumentsModalOpen] =
    useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState({
    users: [],
    documents: [],
  });

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      // Fetch autocomplete suggestions for both users and documents
      const fetchSuggestions = async () => {
        try {
          const usersResponse = await axios.get(
            `/users/suggestions?uploadedBy=${searchQuery}`
          );
          const documentsResponse = await axios.get(
            `/documents/suggestions?documentName=${searchQuery}`
          );
          setAutocompleteSuggestions({
            users: usersResponse.data,
            documents: documentsResponse.data,
          });
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          // Handle error (show error message, etc.)
        }
      };

      fetchSuggestions();
    } else {
      setAutocompleteSuggestions({ users: [], documents: [] });
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      const response = await axios.get("/global-search", {
        params: { query: searchQuery },
      });
      setSearchResults(response.data);
      setIsSearchModalOpen(true); // Open search results modal
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsUserDocumentsModalOpen(true); // Open user documents modal
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const closeUserDocumentsModal = () => {
    setIsUserDocumentsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex justify-between items-center h-16 px-4">
      {/* Search Inputs */}
      <div className="flex  justify-start gap-2 border border-gray-500 rounded-full px-3 py-1 shadow-md shadow-gray-400 h-10 relative ">
        <input
          type="text"
          placeholder="Search Documents"
          value={searchQuery}
          onChange={handleInputChange}
          className="border-none outline-none w-full"
        />
        {autocompleteSuggestions.users.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg">
            {autocompleteSuggestions.users.map((suggestion) => (
              <li
                key={suggestion._id}
                onClick={() => setSearchQuery(suggestion.name)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {suggestion.name} (User)
              </li>
            ))}
          </ul>
        )}
        {autocompleteSuggestions.documents.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg">
            {autocompleteSuggestions.documents.map((suggestion) => (
              <li
                key={suggestion._id}
                onClick={() => setSearchQuery(suggestion.documentName)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {suggestion.documentName} (Document)
              </li>
            ))}
          </ul>
        )}
        <button
          className="bg-primary p-1 rounded-full shadow-md shadow-gray-100 w-6 border border-gray-800"
          onClick={handleSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      {/* MIA Logo */}
      <div className="flex-1 flex justify-center">
        <Link to={"/"}>
          <img
            src={
              "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Manila_International_Airport_Authority_%28MIAA%29.svg/1199px-Manila_International_Airport_Authority_%28MIAA%29.svg.png"
            }
            alt="MIA Logo"
            width="150"
          />
        </Link>
      </div>

      {/* Sign-in/Register */}
      <div className="flex items-center gap-2 border border-gray-500 rounded-full px-3 py-1 shadow-md shadow-gray-400 h-10">
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
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        {/* Add conditional rendering based on user authentication */}
        <div>
          <Link to={user ? "/AccountPage" : "/LoginPage"}>
            <div className="flex pl-2 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  clipRule="evenodd"
                />
              </svg>
              {!!user && <div>{user.name}</div>}
            </div>
          </Link>
        </div>
      </div>

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        searchResults={searchResults}
        onUserClick={handleUserClick} // Pass the handler to open user documents modal
      />

      {/* User Documents Modal */}
      <UserDocumentsModal
        isOpen={isUserDocumentsModalOpen}
        onClose={closeUserDocumentsModal}
        user={selectedUser}
      />
    </div>
  );
}
