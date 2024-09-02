import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react"; // Assuming you're using Context API for user state
import { UserContext } from "./UserContext"; // Replace with your actual context path

function Layout() {
  const { user } = useContext(UserContext); // Assuming user context provides the current user

  return (
    <div className="p-4 flex flex-col min-h-screen">
      {user && <Header />} {/* Only render Header if there is a user */}
      <Outlet />
    </div>
  );
}

export default Layout;
