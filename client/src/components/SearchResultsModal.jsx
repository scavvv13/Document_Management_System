import React from "react";

const SearchResultsModal = ({
  isOpen,
  onClose,
  searchResults,
  onUserClick,
}) => {
  if (!isOpen) return null;

  // Check if searchResults is not empty
  const hasSearchResults = searchResults && searchResults.length > 0;

  // Check if searchResults is empty
  const isEmptySearch = searchResults && searchResults.length === 0;

  // If searchResults is empty, display "No results found."
  if (isEmptySearch) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-75">
        <div className="bg-white p-4 rounded-md shadow-lg max-w-3xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Search Results</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto max-h-96">
            <p className="text-center text-gray-500">No results found.</p>
          </div>
        </div>
      </div>
    );
  }

  // If searchResults is not empty, filter and display the search results
  const userResults = searchResults.filter((result) => result.type === "user");
  const documentResults = searchResults.filter(
    (result) => result.type === "document"
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-4 rounded-md shadow-lg max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-96">
          {hasSearchResults && (
            <>
              {/* Display Users if there are user results */}
              {userResults.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Users</h3>
                  {userResults.map((user) => (
                    <div
                      key={user._id}
                      className="cursor-pointer border-b border-gray-200 pb-2 mb-2"
                      onClick={() => onUserClick(user)} // Call onUserClick handler on user click
                    >
                      <h3 className="font-bold">{user.name}</h3>
                      <p>Email: {user.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Display Documents if there are document results */}
              {documentResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Documents</h3>
                  {documentResults.map((doc) => (
                    <div
                      key={doc._id}
                      className="border-b border-gray-200 pb-2 mb-2"
                    >
                      <h3 className="font-bold">{doc.originalname}</h3>
                      <p>Uploaded By: {doc.uploadedBy}</p>
                      {/* Ensure doc.createdAt is in a valid format */}
                      <p>
                        Time Uploaded:{" "}
                        {new Date(doc.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsModal;
