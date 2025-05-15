import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ color = "blue", onLogout }) => {
  const navigate = useNavigate();

  const gradient =
    color === "green"
      ? "from-green-500 to-green-700"
      : color === "purple"
      ? "from-purple-500 to-purple-700"
      : color === "bluepurple"
      ? "from-blue-500 to-purple-500"
      : "from-blue-500 to-indigo-700";

  return (
    <header className={`bg-gradient-to-r ${gradient} shadow-md`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer">
          <i className="fas fa-graduation-cap text-2xl text-white"></i>
          <span className="text-xl font-bold text-white">SmartLectures</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-white rounded-full font-medium hover:bg-gray-100 transition"
          >
            <span className={`bg-gradient-to-r ${gradient} text-transparent bg-clip-text font-semibold`}>
              <i className="fas fa-home mr-2"></i>На главную
            </span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-5 py-2 bg-white rounded-full font-medium hover:bg-gray-100 transition text-red-600"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Выйти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
