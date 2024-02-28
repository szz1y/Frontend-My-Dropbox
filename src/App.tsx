import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./authentication/Login";
import Register from "./authentication/Register";
import IndexLayout from "./Layout";
import NotFound from "./NotFound";
import Home from "./page/home";
import Search from "./page/search";
import Profile from "./page/profile";
import Folder from "./page/folder";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/register"
          element={<Register setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route path="/" element={<IndexLayout />}>
          <Route path="/" index element={<Home />} />
          <Route path="/folder/:folderId" element={<Folder />} />
          <Route path="/search" index element={<Search />} />
          <Route path="/profile" index element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
