import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import MyDocuments from "./MyDocuments";
import UsersAndDocuments from "./UsersAndDocuments"; // Ensure to import this component

const AccountPage = () => {
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  let { subpage } = useParams();

  if (subpage === undefined) {
    subpage = "profile";
  }

  const logout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      setUser(null); // Clear user state after logout
      setRedirect("/"); // Set redirect after successful logout
    } catch (error) {
      console.error("Logout error:", error); // Handle logout error
    }
  };

  if (!ready) {
    return "Loading...";
  }

  if (!user && !redirect) {
    return <Navigate to={"/LoginPage"} />;
  }

  const linkClasses = (type = null) => {
    let classes = "p-2 px-6";
    if (type === subpage) {
      classes += " bg-red-500 text-white rounded-full";
    }
    return classes;
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <nav className="w-full gap-2 mb-15 justify-center flex">
        {/* Optional: Add navigation links using linkClasses */}
        <Link to="/account/profile" className={linkClasses("profile")}>
          Profile
        </Link>
        <Link to="/account/documents" className={linkClasses("documents")}>
          My Documents
        </Link>
        <Link to="/account/users" className={linkClasses("users")}>
          Users
        </Link>
      </nav>

      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto mt-10">
          Logged in as {user.name} ({user.email}) <br />
          <button onClick={logout} className="primary max-w-sm mt-8">
            Logout
          </button>
        </div>
      )}
      {subpage === "documents" && <MyDocuments />}
      {subpage === "users" && <UsersAndDocuments />}
      {/* Optional: Handle invalid subpage */}
      {subpage !== "profile" &&
        subpage !== "documents" &&
        subpage !== "users" && (
          <div className="text-center max-w-lg mx-auto mt-10">
            <p>Invalid subpage. Please select a valid option.</p>
          </div>
        )}
    </div>
  );
};

export default AccountPage;
