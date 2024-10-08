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
      <div className="flex flex-col md:flex-row h-screen bg-base-100">
        {!user && (
            <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-4 md:p-8 bg-gray-100 shadow-md">
              <LoginPage />
            </div>
        )}

        <div className="flex-1 p-4 md:p-10 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 overflow-y-auto">
          {/* Add/Edit Memo Form */}
          {user && user.isAdmin && (
              <div className="md:w-1/3 bg-gray-50 p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                  {isEditing ? "Edit Memo" : "Add New Memo"}
                </h2>
                <form onSubmit={handleAddOrUpdateMemo}>
                  <div className="mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter memo title"
                        className="w-full p-2 md:p-3 border rounded-lg"
                    />
                  </div>
                  <div className="mb-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter memo content"
                    rows="5"
                    className="w-full p-2 md:p-3 border rounded-lg"
                />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                        type="submit"
                        className="btn btn-success"
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
                            className="btn"
                        >
                          Cancel
                        </button>
                    )}
                  </div>
                </form>
              </div>
          )}

          {/* Memos List */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-gray-900 text-center">
              Memorandum / Announcements
            </h1>

            {pinnedMemo && (
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    Pinned Memo
                  </h2>
                  <div className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-sm">
                    <h3 className="text-md md:text-lg font-medium mb-2 text-gray-800">
                      {pinnedMemo.title}
                    </h3>
                    <p className="text-sm md:text-md text-gray-700">
                      {pinnedMemo.content}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button
                          onClick={handleUnpinMemo}
                          className="btn btn-error"
                      >
                        Unpin Memo
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {memos.map((memoGroup) => (
                <div key={memoGroup.title}>
                  <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    {memoGroup.title}
                  </h2>
                  <div className="space-y-4">
                    {memoGroup.memos.map((memo) => (
                        <div
                            key={memo._id}
                            className="bg-gray-50 p-4 md:p-6 rounded-lg shadow-sm"
                        >
                          <h3 className="text-md md:text-lg font-medium mb-2 text-gray-800">
                            {memo.title}
                          </h3>
                          <p className="text-sm md:text-md text-gray-700">
                            {memo.content}
                          </p>
                          <div className="mt-4 flex justify-end space-x-2">
                            {user && user.isAdmin && (
                                <>
                                  <button
                                      onClick={() => handleEditMemo(memo)}
                                      className="btn btn-warning"
                                  >
                                    Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeleteMemo(memo._id)}
                                      className="btn btn-error"
                                  >
                                    Delete
                                  </button>
                                </>
                            )}
                            <button
                                onClick={() => handlePinMemo(memo)}
                                className="btn btn-info"
                            >
                              Pin
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default MemosPage;
