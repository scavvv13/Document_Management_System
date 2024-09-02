import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext.jsx";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle show/hide password
  const { setUser } = useContext(UserContext);

  // Function to handle form submission
  async function loginUser(event) {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        `https://document-management-system-1-0b91.onrender.com/LoginPage`,
        { email, password }
      );
      setUser(data);
      alert("Login successful");
      setRedirect(true);
    } catch (error) {
      alert("Login failed");
    }
  }

  // Function to toggle show/hide password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="mt-20 grow flex items-center justify-around">
      <div className="mb-60">
        <h1 className="text-4xl text-center mb-10">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={loginUser}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="primary mt-4">Login</button>
          <div className="text-center py-2">
            <button
              type="button"
              className=" text-gray-500 hover:underline focus:outline-none"
              onClick={toggleShowPassword}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
          <div className="text-center py-5 text-gray-500">
            Don't have an account yet?
            <Link to={"/RegisterPage"} className="underline text-black">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
