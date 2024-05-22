import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function registerUser(event) {
    event.preventDefault();
    //eto pare imbis na fetch ng react ginamit ko nag Axios library ako para madali
    axios.post("/RegisterPage", { name, email, password }).catch((error) => {
      //yang localhost na yan par yan ung port nung backend jan siya kukuha ng API
      console.log(error);
    });
  }

  return (
    <div className="mt-4 grow flex items-center justify-around ">
      <div className="mb-60">
        <h1 className=" text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" onSubmit={registerUser}>
          <input
            type="text"
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <button className="primary">Register</button>
          <div className=" text-center py-5 text-gray-500">
            Have an Account?
            <Link to={"/LoginPage"} className=" underline text-black">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
