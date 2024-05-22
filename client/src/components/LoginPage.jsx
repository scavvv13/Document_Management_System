import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  async function LoginUser(event) {
    event.preventDefault();
    try {
      await axios.post(
        "/LoginPage",
        { email, password },
        { withCredentials: true }
      );
      alert("Login Successful!");
      setRedirect(true);
    } catch (except) {
      alert("Login Failed. Please Try Again");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="mt-4 grow flex items-center justify-around ">
      <div className="mb-60">
        <h1 className=" text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={LoginUser}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary">Login</button>
          <div className=" text-center py-5 text-gray-500">
            Don't Have An Account Yet?
            <Link to={"/RegisterPage"} className=" underline text-black">
              {" "}
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
