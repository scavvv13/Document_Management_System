import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div className="mt-4 grow flex items-center justify-around ">
      <div className="mb-60">
        <h1 className=" text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto">
          <input type="email" placeholder="your@email.com" />
          <input type="password" placeholder="password" />
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
