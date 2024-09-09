import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import SearchInput from "./SearchInput";
import SearchResultsModal from "./SearchResultsModal";
import UserDocumentsModal from "./UserDocumentsModal";
import { UserContext } from "../UserContext";
import Notification from "./Notification";

const Header = () => {
  const { user, isAdmin } = useContext(UserContext);
  const location = useLocation();

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
      const params = {
        query: searchQuery,
        userId: user._id,
        isAdmin: isAdmin ? "true" : "false",
      };

      const response = await axios.get("/global-search", { params });

      setSearchResults(response.data);
      setIsSearchModalOpen(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setIsSearchModalOpen(true);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsUserDocumentsModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery("");
  };

  const closeUserDocumentsModal = () => {
    setIsUserDocumentsModalOpen(false);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
  };

  const getLinkClassName = (path) => {
    return location.pathname === path
      ? "text-base sm:text-xl font-bold bg-red-500 text-white rounded-full px-3 py-1"
      : "text-base sm:text-xl font-bold";
  };

  return (
    <div className="flex flex-col sm:flex-row items-center h-auto sm:h-16 px-4 justify-between space-y-3 sm:space-y-0">
      <div className="flex items-center">
        <Link to="/">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Manila_International_Airport_Authority_%28MIAA%29.svg/1199px-Manila_International_Airport_Authority_%28MIAA%29.svg.png"
            alt="MIA Logo"
            className="w-24 sm:w-36"
          />
        </Link>
      </div>

      <div className="flex-1 mx-4 sm:mx-20">
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          onSearch={handleSearch}
          suggestions={autocompleteSuggestions}
          clearSearch={() => setSearchQuery("")}
        />
      </div>

      {user && (
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-4 mr-5">
          <Link to="/" className={getLinkClassName("/")}>
            Home
          </Link>
          <Link
            to="/AccountPage/documents"
            className={getLinkClassName("/AccountPage/documents")}
          >
            Documents
          </Link>

          {user.isAdmin && (
            <Link
              to="/AccountPage/users"
              className={getLinkClassName("/AccountPage/users")}
            >
              Users
            </Link>
          )}
        </div>
      )}

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

      {user && <Notification />}

      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        searchResults={searchResults}
        onUserClick={handleUserClick}
      />
      {isAdmin && (
        <UserDocumentsModal
          isOpen={isUserDocumentsModalOpen}
          onClose={closeUserDocumentsModal}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Header;
