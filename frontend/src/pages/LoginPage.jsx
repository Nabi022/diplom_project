import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("username", username);
      navigate("/");
    } else {
      setError(data.detail || "Неверное имя пользователя или пароль");
    }
  } catch {
    setError("Ошибка подключения к серверу");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Левая часть — описание */}
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 text-white">
          <h2 className="text-3xl font-bold mb-6">SmartLectures</h2>
          <h3 className="text-2xl font-semibold mb-4">Учитесь эффективнее с ИИ</h3>
          <p className="text-sm text-purple-100">
            Загружайте лекции, создавайте конспекты, контрольные вопросы и тесты — всё в одном месте.
          </p>
        </div>

        {/* Правая часть — форма входа */}
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Вход в аккаунт</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition"
            >
              Войти
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Нет аккаунта?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-purple-600 hover:underline cursor-pointer"
            >
              Зарегистрироваться
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
