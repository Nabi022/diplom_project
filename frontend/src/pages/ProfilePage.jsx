import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";
import AnimatedPage from "../pages/AnimatedPage";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
  });
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");

  useEffect(() => {
    const data = localStorage.getItem("profileData");
    if (data) setFormData(JSON.parse(data));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("profileData", JSON.stringify(formData));
    alert("Данные сохранены!");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      localStorage.setItem("avatar", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatedPage>
      <div className="bg-gray-50 min-h-screen text-sm">
        <Header color="bluepurple" onLogout={handleLogout} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 flex flex-col md:flex-row items-center">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <label className="cursor-pointer">
                  <img
                    src={avatar || "https://via.placeholder.com/150"}
                    alt="Аватар"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow">
                    <i className="fas fa-pencil-alt text-purple-600 text-sm"></i>
                  </div>
                </label>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  {formData.firstName || "Имя"} {formData.lastName || "Фамилия"}
                </h2>
                <p className="text-gray-600">
                  {formData.university || "Учебное заведение"}
                </p>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-user-circle text-purple-500 mr-3"></i> Личная информация
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <label className="floating-label">Имя</label>
                  </div>
                  <div className="relative">
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <label className="floating-label">Фамилия</label>
                  </div>
                </div>
                <div className="relative">
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <label className="floating-label">Email</label>
                </div>
                <div className="relative">
                  <input
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder=" "
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <label className="floating-label">Учебное заведение</label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ firstName: "", lastName: "", email: "", university: "" })}
                    className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Отменить
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-6 rounded-lg hover:opacity-90 shadow-md"
                  >
                    Сохранить
                  </button>
                </div>
              </form>

              <hr className="my-8 border-gray-100" />

              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-book-open text-purple-500 mr-3"></i> Мои лекции
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 hover:bg-purple-50 transition">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-600">
                      Математика
                    </span>
                    <span className="text-xs text-gray-400">2 дня назад</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Теория вероятностей</h4>
                  <p className="text-gray-500 text-sm">Основные понятия и формулы</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 hover:bg-purple-50 transition">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-600">
                      Программирование
                    </span>
                    <span className="text-xs text-gray-400">1 неделя назад</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Алгоритмы поиска</h4>
                  <p className="text-gray-500 text-sm">Деревья и хеш-таблицы</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ProfilePage;
