import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

function Header() {
  const { user } = useContext(UserContext);
  return (
    //MIAA logo
    <div className="flex justify-between">
      <img
        src={
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Manila_International_Airport_Authority_%28MIAA%29.svg/1199px-Manila_International_Airport_Authority_%28MIAA%29.svg.png"
        }
        alt="Image description"
        width="150"
      />
      {/* NAVBAR--------------- */}
      <div className="gap-2 flex border border-gray-500 rounded-full px-4 py-2 shadow-md shadow-gray-400 h-12">
        <div>Origin</div>
        <div className="border-l border-gray-400"></div>
        <div>Destination</div>
        <div className="border-l border-gray-400"></div>
        <div>Type</div>
        <button className="bg-primary p-1 rounded-full shadow-md shadow-gray-100 w-6 border border-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
      {/* SIGNIN/REGISTER--------------------------- */}
      <div className="flex items-center gap-2 border border-gray-500 rounded-full px-4 py-2 shadow-md shadow-gray-400 h-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>

        <div>
          <Link to="/LoginPage" className=" ">
            <div className="flex pl-2 items-center">
              {" "}
              {/* Added items-center for vertical alignment */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  clipRule="evenodd"
                />
              </svg>
              {!!user && <div>{user.name}</div>}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
