import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

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
        const response = await axios.get("http://localhost:5005/memos");
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

        // Group memos by date
        const groupedMemos = response.data.reduce((acc, memo) => {
          const dateKey = getFormattedDate(memo.createdAt);
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(memo);
          return acc;
        }, {});

        // Convert grouped memos object to array for rendering
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
        // Update memo
        const response = await axios.put(
          `http://localhost:5005/memos/${currentMemoId}`,
          { title, content }
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
        // Add memo
        const response = await axios.post("http://localhost:5005/memos", {
          title,
          content,
        });
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

      await axios.delete(`http://localhost:5005/memos/${id}`);
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
    <div className="container mx-auto p-4 flex">
      {/* Sidebar for Add Memo */}
      <div className="w-1/4 bg-white rounded shadow-lg p-4 mb-6 mr-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Memo</h2>
        {user && user.isAdmin && (
          <form onSubmit={handleAddOrUpdateMemo}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full p-1 mb-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              required
              className="w-full p-1 mb-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            >
              {isEditing ? "Update Memo" : "Add Memo"}
            </button>
          </form>
        )}
      </div>

      {/* Main Content for Displaying Memos */}
      <div className="flex-1 bg-white rounded shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Memos
        </h1>
        {pinnedMemo && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-700">
              Pinned Memo
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {pinnedMemo.title}
              </h3>
              <p className="mb-2 text-gray-700">{pinnedMemo.content}</p>
              <p className="text-gray-500 text-sm">
                {new Date(pinnedMemo.createdAt).toLocaleString()}
              </p>
              {user && user.isAdmin && (
                <button
                  onClick={handleUnpinMemo}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  Unpin
                </button>
              )}
            </div>
          </div>
        )}
        {memos.map((memoGroup) => (
          <div key={memoGroup.title} className="mb-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-700">
              {memoGroup.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoGroup.memos
                .filter((memo) => !pinnedMemo || memo._id !== pinnedMemo._id)
                .map((memo) => (
                  <div
                    key={memo._id}
                    className="bg-gray-50 p-4 rounded-lg shadow-inner transition-transform transform hover:scale-105"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      {memo.title}
                    </h3>
                    <p className="mb-2 text-gray-700">{memo.content}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(memo.createdAt).toLocaleString()}
                    </p>
                    {user && user.isAdmin && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="w-1/3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo._id)}
                          className="w-1/3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handlePinMemo(memo)}
                          className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                        >
                          Pin
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemosPage;
