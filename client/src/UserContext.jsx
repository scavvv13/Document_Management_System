import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/profile", { withCredentials: true });

        // Check if data is null or if there's an error message in the response
        if (
          !data ||
          data.message === "Invalid or expired token" ||
          data.message === "No token provided"
        ) {
          setUser(null); // Log the user out or clear the user state
        } else {
          setUser(data); // Set the user if data is valid
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser(null); // Set user to null if there's a network or server error
      } finally {
        setReady(true); // Indicate that the fetch attempt is complete
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
