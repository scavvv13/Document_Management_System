import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle show/hide password

  // Password validation regex: must be 16 characters or longer, alphanumeric with special characters
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{16,}$/;

  // Function to handle form submission
  async function registerUser(event) {
    event.preventDefault();

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be 16 characters or longer and include alphanumeric characters with special characters."
      );
      return;
    }

    try {
      await axios.post("/RegisterPage", { name, email, password });
      alert("Registration successful. You can now log in.");
      Navigate("/LoginPage");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again later.");
    }
  }

  // Function to toggle show/hide password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-60">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="your@email.com"
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
            <button
              type="button"
              className=" right-0 px-3 py-2 border-none rounded-full"
              onClick={toggleShowPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          <button className="primary mt-4">Register</button>
          <div className="text-center py-5 text-gray-500">
            Already have an account?
            <Link to={"/LoginPage"} className="underline text-black">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
