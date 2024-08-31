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
        const response = await axios.get(`http://localhost:5006/memos`);
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
          `http://localhost:5006/memos/${currentMemoId}`,
          {
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
        const response = await axios.post(`http://localhost:5006/memos`, {
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

      await axios.delete(`http://localhost:5006/memos/${id}`);
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
    <div className="flex h-screen bg-gray-50">
      {/* Left section: Login */}
      {!user && (
        <div className="w-1/3 flex flex-col justify-center items-center p-8 bg-white shadow-md">
          <div className="w-full max-w-sm flex flex-col items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Manila_International_Airport_Authority_%28MIAA%29.svg/1280px-Manila_International_Airport_Authority_%28MIAA%29.svg.png"
              alt="MIAA Logo"
              className="mb-1 mt-20" // Adjust these values to bring the logo down
            />
            <h2 className="text-2xl font-semibold mb-6 text-gray-900"></h2>
            <LoginPage />
          </div>
        </div>
      )}

      {/* Right section: Memos */}

      <div className=" p-10 flex justify-center overflow-y-auto">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-semibold mb-8 text-gray-900 text-center">
            Memorandum / Announcements
          </h1>
          {pinnedMemo && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Pinned Memo
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-gray-800">
                  {pinnedMemo.title}
                </h3>
                <p className="mb-3 text-gray-700">{pinnedMemo.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(pinnedMemo.createdAt).toLocaleString()}
                </p>
                {user && user.isAdmin && (
                  <button
                    onClick={handleUnpinMemo}
                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg"
                  >
                    Unpin
                  </button>
                )}
              </div>
            </div>
          )}

          {memos.map((memoGroup) => (
            <div key={memoGroup.title} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {memoGroup.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memoGroup.memos
                  .filter((memo) => !pinnedMemo || memo._id !== pinnedMemo._id)
                  .map((memo) => (
                    <div
                      key={memo._id}
                      className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <h3 className="text-lg font-medium mb-2 text-gray-800">
                        {memo.title}
                      </h3>
                      <p className="mb-3 text-gray-700">{memo.content}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(memo.createdAt).toLocaleString()}
                      </p>
                      {user && user.isAdmin && (
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={() => handleEditMemo(memo)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMemo(memo._id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handlePinMemo(memo)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
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
    </div>
  );
};

export default MemosPage;
