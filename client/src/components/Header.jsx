import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchInput from "./SearchInput"; // New component for search input
import SearchResultsModal from "./SearchResultsModal";
import UserDocumentsModal from "./UserDocumentsModal";
import { UserContext } from "../UserContext";

export default function Header() {
  const { user } = useContext(UserContext);

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
        }
      };

      fetchSuggestions();
    } else {
      setAutocompleteSuggestions({ users: [], documents: [] });
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      if (searchQuery.trim() !== "") {
        console.log("Search Query:", searchQuery); // Debugging line
        const response = await axios.get("/global-search", {
          params: { query: searchQuery },
        });
        console.log("Search Results:", response.data); // Debugging line
        setSearchResults(response.data);
        setIsSearchModalOpen(true);
      } else {
        setSearchResults([]);
        setIsSearchModalOpen(true); // Ensure modal opens to show "No results found."
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setIsSearchModalOpen(true); // Ensure modal opens on error to show "No results found."
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsUserDocumentsModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery(""); // Clear search query when closing modal
  };

  const closeUserDocumentsModal = () => {
    setIsUserDocumentsModalOpen(false);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="flex justify-between items-center h-16 px-4">
      {/* Search Input Component */}
      <SearchInput
        value={searchQuery}
        onChange={handleInputChange}
        onSearch={handleSearch}
        suggestions={autocompleteSuggestions}
        clearSearch={() => setSearchQuery("")}
      />

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

      {/* User Info and Authentication */}
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

      {/* Modals */}
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        searchResults={searchResults}
        onUserClick={handleUserClick}
      />
      <UserDocumentsModal
        isOpen={isUserDocumentsModalOpen}
        onClose={closeUserDocumentsModal}
        user={selectedUser}
      />
    </div>
  );
}
