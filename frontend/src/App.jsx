import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LecturePage from "./pages/LecturePage";
import QuizPage from "./pages/QuizPage";
import TestPage from "./pages/TestPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,  // анимация длится 800мс
      once: true,     // срабатывает только один раз
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lecture" element={<LecturePage />} />
        <Route path="/questions" element={<QuizPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
