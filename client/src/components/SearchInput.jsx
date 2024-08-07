import React, { useRef, useEffect } from "react";
import axios from "axios";

const SearchInput = ({
  value,
  onChange,
  onSearch,
  suggestions,
  clearSearch,
}) => {
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target) &&
      suggestionRef.current &&
      !suggestionRef.current.contains(event.target)
    ) {
      clearSearch();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = async (suggestionValue) => {
    try {
      onChange(suggestionValue); // Update input value with suggestion
      await onSearch(); // Trigger search
      clearSearch(); // Clear search input
    } catch (error) {
      console.error("Error handling suggestion click:", error);
      // Handle error (e.g., display error message to user)
    }
  };

  return (
    <div className="flex justify-start gap-2 border border-gray-500 rounded-full px-3 py-1 shadow-md shadow-gray-400 h-10 relative">
      <input
        type="text"
        placeholder="Search Documents"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-none outline-none w-full"
        ref={inputRef}
      />
      {(suggestions.users.length > 0 || suggestions.documents.length > 0) && (
        <ul
          ref={suggestionRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg"
        >
          {suggestions.users.map((suggestion) => (
            <li
              key={suggestion._id}
              onClick={() => handleSuggestionClick(suggestion.name)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {suggestion.name} (User)
            </li>
          ))}
          {suggestions.documents.map((suggestion) => (
            <li
              key={suggestion._id}
              onClick={() => handleSuggestionClick(suggestion.originalname)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {suggestion.originalname} (Document)
            </li>
          ))}
        </ul>
      )}
      <button
        className=" p-1 rounded-full shadow-md shadow-gray-100 w-6 border border-gray-800"
        onClick={onSearch}
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
  );
};

export default SearchInput;
