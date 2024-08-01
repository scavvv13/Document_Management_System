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

  async function logout() {
    await axios.post("/logout");
    setRedirect("/");
    setUser(null);
  }

  if (!ready) {
    return "Loading...";
  }

  if (ready && !user && !redirect) {
    return <Navigate to={"/LoginPage"} />;
  }

  function linkClasses(type = null) {
    let classes = " p-2 px-6";
    if (type === subpage) {
      classes += " bg-red-500 text-white rounded-full ";
    }
    return classes;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <nav className="w-full  gap-2 mb-15 justify-center flex"></nav>
      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto mt-10">
          Logged in as {user.name} ({user.email}) <br />
          <button onClick={logout} className="primary max-w-sm mt-8">
            Logout
          </button>
        </div>
      )}
      {subpage === "documents" && <MyDocuments />}
      {subpage === "users" && <UsersAndDocuments />}{" "}
      {/* Render UsersAndDocuments component */}
    </div>
  );
};

export default AccountPage;
