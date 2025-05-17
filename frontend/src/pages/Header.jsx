import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ onLogout, color = "bluegreen", styleType = "floating" }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const gradient =
    color === "green"
      ? "from-green-600 via-green-500 to-emerald-400"
      : color === "purple"
      ? "from-purple-400 to-purple-700"
      : color === "bluepurple"
      ? "from-blue-600 via-purple-500 to-indigo-500"
      : color === "bluegreen"
      ? "from-sky-600 via-cyan-400 to-emerald-400"
      : "from-blue-500 via-indigo-500 to-purple-500";

  const headerClasses =
    styleType === "floating"
      ? "top-6 left-6 right-6 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.3)]"
      : "top-0 left-0 right-0 rounded-none shadow-md";

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false); // скролл вниз
      } else {
        setVisible(true); // скролл вверх
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed z-50 bg-gradient-to-r ${gradient} bg-[length:200%] animate-gradient-x border border-white/30
      px-6 py-3 flex items-center justify-between transition-transform duration-500
      ${headerClasses} ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* Логотип */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-xl font-bold text-white cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        <i className="fas fa-graduation-cap"></i>
        <span>SmartLectures</span>
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="bg-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/80 transition"
        >
          <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-semibold flex items-center gap-2`}>
            <i className="fas fa-home"></i> На главную
          </span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/80 transition"
          >
            <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-semibold flex items-center gap-2`}>
              <i className="fas fa-sign-out-alt"></i> Выйти
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
