import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import IndexPage from "./components/IndexPage";
import Layout from "./Layout";
import RegisterPage from "./components/RegisterPage";
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import AccountPage from "./components/AccountPage";
import Modal from "react-modal";

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  "https://document-management-system-1-0b91.onrender.com";

// Set the app element for react-modal for accessibility
Modal.setAppElement("#root");

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/RegisterPage" element={<RegisterPage />} />
          <Route path="/AccountPage/:subpage?" element={<AccountPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
