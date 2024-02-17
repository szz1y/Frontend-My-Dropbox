import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./authentication/Login";
import Register from "./authentication/Register";
import IndexLayout from "./Layout";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        {isAuthenticated ? (
          <Route path="/" element={<IndexLayout />} />
        ) : (
          <Route path="/" element={<Navigate to="/login" replace={true} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
