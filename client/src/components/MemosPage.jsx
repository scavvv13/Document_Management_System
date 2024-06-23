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

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded shadow p-4 mb-4">
        <h1 className="text-2xl font-bold text-center mb-4">Memos</h1>
        {user && user.isAdmin && (
          <form
            onSubmit={handleAddOrUpdateMemo}
            className="mb-4 bg-white p-4 rounded shadow"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              required
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {isEditing ? "Update Memo" : "Add Memo"}
            </button>
          </form>
        )}
        {memos.map((memoGroup) => (
          <div key={memoGroup.title} className="mb-4">
            <h2 className="text-xl font-bold mb-2">{memoGroup.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoGroup.memos.map((memo) => (
                <div key={memo._id} className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-semibold mb-2">{memo.title}</h3>
                  <p className="mb-2">{memo.content}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(memo.createdAt).toLocaleString()}
                  </p>
                  {user && user.isAdmin && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditMemo(memo)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Delete
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
