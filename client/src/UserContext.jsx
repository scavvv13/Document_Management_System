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
        // Handle the case where the server returns null or an error
        if (data && data.error) {
          setUser(null); // or handle specific error cases
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser(null); // handle network errors
      } finally {
        setReady(true); // Set ready to true after attempting to fetch user
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
