import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

const Notification = () => {
  const { user } = useContext(UserContext);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(`/notifications?userId=${user._id}`);
          setNotifications(response.data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();
    }
  }, [user]);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`, {
        userId: user._id,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteReadNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`, {
        data: { userId: user._id },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative flex items-center gap-2 border border-gray-500 rounded-full px-3 py-1 shadow-md shadow-gray-400 h-10 ml-3"
      >
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
            d="M12 22.5c1.215 0 2.25-.975 2.25-2.175h-4.5c0 1.2 1.035 2.175 2.25 2.175zm4.95-3.825v-4.65c0-3.15-1.68-5.25-4.95-5.25s-4.95 2.1-4.95 5.25v4.65H6.75a.75.75 0 1 1 0-1.5h10.5a.75.75 0 0 1 0 1.5h-1.5z"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {notifications.filter((notification) => !notification.read).length}
          </span>
        )}
      </button>
      {isNotificationsOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg ml-5 max-h-96 overflow-y-auto">
          <div className="p-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-gray-200 pb-2 mb-2 ${
                    notification.read ? "opacity-50" : ""
                  }`}
                >
                  <div className="text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleString()}
                  </div>
                  <div className="flex justify-between items-center">
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification._id)}
                        className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
                      >
                        Mark as Read
                      </button>
                    )}
                    {notification.read && (
                      <button
                        onClick={() => deleteReadNotification(notification._id)}
                        className="text-xs text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
