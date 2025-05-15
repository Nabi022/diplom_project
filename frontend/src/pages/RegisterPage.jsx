import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const err = await response.json();
        setError(err.username?.[0] || "Ошибка регистрации");
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
          <h3 className="text-2xl font-semibold mb-4">Присоединяйтесь к нам</h3>
          <p className="text-sm text-purple-100">
            Получайте доступ к мощным инструментам для автоматизации учебного процесса.
          </p>
        </div>

        {/* Правая часть — форма регистрации */}
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Регистрация</h2>
          <form onSubmit={handleRegister} className="space-y-5">
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

            <div>
              <label className="block text-gray-600 text-sm mb-1">Подтверждение пароля</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition"
            >
              Зарегистрироваться
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Уже есть аккаунт?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-600 hover:underline cursor-pointer"
            >
              Войти
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
