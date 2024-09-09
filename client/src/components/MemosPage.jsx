import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import LoginPage from "./LoginPage";

const MemosPage = () => {
  const { user } = useContext(UserContext);
  const [memos, setMemos] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemoId, setCurrentMemoId] = useState(null);
  const [pinnedMemo, setPinnedMemo] = useState(null);

  useEffect(() => {
    const fetchMemos = async () => {
      try {
        const response = await axios.get(
          `https://document-management-system-1-0b91.onrender.com/memos`,
          {
            withCredentials: true,
          }
        );
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const getFormattedDate = (date) => {
          const memoDate = new Date(date);
          const daysDifference = Math.floor(
            (today - memoDate) / (1000 * 60 * 60 * 24)
          );

          if (memoDate.toDateString() === today.toDateString()) {
            return "Today";
          } else if (memoDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
          } else if (daysDifference < 7) {
            return memoDate.toLocaleString("default", { weekday: "long" });
          } else {
            return memoDate.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            });
          }
        };

        const groupedMemos = response.data.reduce((acc, memo) => {
          const dateKey = getFormattedDate(memo.createdAt);
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(memo);
          return acc;
        }, {});

        const memosArray = Object.keys(groupedMemos).map((key) => ({
          title: key,
          memos: groupedMemos[key],
        }));

        setMemos(memosArray);
      } catch (error) {
        console.error("Error fetching memos:", error);
      }
    };

    fetchMemos();
  }, []);

  const handleAddOrUpdateMemo = async (e) => {
    e.preventDefault();

    if (!title || !content) return;

    try {
      if (!user || !user.isAdmin) {
        console.error("Unauthorized: Only admins can add or edit memos", user);
        return;
      }

      if (isEditing) {
        const response = await axios.put(
          `https://document-management-system-1-0b91.onrender.com/memos/${currentMemoId}`,
          {
            withCredentials: true,

            title,
            content,
          }
        );
        setMemos((prevMemos) =>
          prevMemos.map((memoGroup) => ({
            ...memoGroup,
            memos: memoGroup.memos.map((memo) =>
              memo._id === currentMemoId ? response.data : memo
            ),
          }))
        );
      } else {
        const response = await axios.post(
          `https://document-management-system-1-0b91.onrender.com/memos`,
          {
            withCredentials: true,

            title,
            content,
          }
        );
        setMemos((prevMemos) => [
          {
            title: "Today",
            memos: [
              response.data,
              ...prevMemos.find((group) => group.title === "Today").memos,
            ],
          },
          ...prevMemos.filter(
            (group) => group.title !== "Today" && group.title !== "Yesterday"
          ),
        ]);
      }

      setTitle("");
      setContent("");
      setIsEditing(false);
      setCurrentMemoId(null);
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} memo:`, error);
    }
  };

  const handleDeleteMemo = async (id) => {
    try {
      if (!user || !user.isAdmin) {
        console.error("Unauthorized: Only admins can delete memos");
        return;
      }

      await axios.delete(
        `https://document-management-system-1-0b91.onrender.com/memos/${id}`,
        {
          withCredentials: true,
        }
      );
      setMemos((prevMemos) =>
        prevMemos.map((memoGroup) => ({
          ...memoGroup,
          memos: memoGroup.memos.filter((memo) => memo._id !== id),
        }))
      );
      if (pinnedMemo && pinnedMemo._id === id) {
        setPinnedMemo(null);
      }
    } catch (error) {
      console.error("Error deleting memo:", error);
    }
  };

  const handleEditMemo = (memo) => {
    setTitle(memo.title);
    setContent(memo.content);
    setIsEditing(true);
    setCurrentMemoId(memo._id);
  };

  const handlePinMemo = (memo) => {
    setPinnedMemo(memo);
  };

  const handleUnpinMemo = () => {
    setPinnedMemo(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left section: Login */}
      {!user && (
        <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-4 md:p-8 bg-white shadow-md">
          <div className="w-full max-w-sm flex flex-col items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Manila_International_Airport_Authority_%28MIAA%29.svg/1280px-Manila_International_Airport_Authority_%28MIAA%29.svg.png"
              alt="MIAA Logo"
              className="mb-4 mt-8 md:mt-20 w-28" // Adjusted for modern design
            />
            <LoginPage />
          </div>
        </div>
      )}

      {/* Right section: Memos */}
      <div className="flex-1 p-4 md:p-10 flex justify-center overflow-y-auto">
        <div className="w-full max-w-3xl bg-white p-8 shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
            Memorandum / Announcements
          </h1>

          {/* Add/Edit Memo Form */}
          {user && user.isAdmin && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {isEditing ? "Edit Memo" : "Add New Memo"}
              </h2>
              <form onSubmit={handleAddOrUpdateMemo} className="mb-6">
                <div className="mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter memo title"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter memo content"
                    rows="5"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    {isEditing ? "Update Memo" : "Add Memo"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setTitle("");
                        setContent("");
                        setCurrentMemoId(null);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Pinned Memo */}
          {pinnedMemo && (
            <div className="p-4 mb-8 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-2 text-yellow-900">
                {pinnedMemo.title} (Pinned)
              </h2>
              <p className="text-gray-700 mb-4">{pinnedMemo.content}</p>
              <button
                onClick={handleUnpinMemo}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition duration-300"
              >
                Unpin
              </button>
            </div>
          )}

          {/* Recent Memos */}
          {memos.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                {group.title}
              </h2>
              {group.memos.map((memo) => (
                <div
                  key={memo._id}
                  className="p-4 mb-4 bg-gray-50 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {memo.title}
                    </h3>
                    {user && user.isAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg transition duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{memo.content}</p>
                  <button
                    onClick={() => handlePinMemo(memo)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-4 mt-2 rounded-lg transition duration-300"
                  >
                    Pin
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemosPage;
