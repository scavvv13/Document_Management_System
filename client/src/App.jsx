import { Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import IndexPage from "./components/IndexPage";
import Layout from "./Layout";
import RegisterPage from "./components/RegisterPage";
import axios from "axios";
import { UserContextProvider } from "./UserContext";

axios.defaults.baseURL = "http://localhost:5005";
function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/RegisterPage" element={<RegisterPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
