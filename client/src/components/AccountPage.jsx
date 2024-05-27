import { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";

export default function AccountPage() {
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
      <nav className=" w-full mt-8 gap-2 mb-8 justify-center flex">
        <Link className={linkClasses("profile")} to={"/AccountPage"}>
          My Profile
        </Link>
        <Link
          className={linkClasses("documents")}
          to={"/AccountPage/documents"}
        >
          My Documents
        </Link>
        <Link className={linkClasses("places")} to={"/AccountPage/places"}>
          Accomodations
        </Link>
      </nav>
      {subpage === "profile" && (
        <div className="text-center m-w-lg mx-auto ">
          Logged in as {user.name} ({user.email}) <br />
          <button onClick={logout} className="primary max-w-sm mt-8">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
