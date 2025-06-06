import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";
import AnimatedPage from "../pages/AnimatedPage";
import { authFetch } from "../utils/authFetch";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
  });
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [joinDate, setJoinDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch("http://127.0.0.1:8000/api/profile/");
        if (res.ok) {
          const user = await res.json();
          setJoinDate(new Date(user.date_joined).toLocaleDateString());
          setFormData({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            email: user.email || "",
            university: user.university || "",
          });
          if (user.avatar) {
            setAvatar("http://127.0.0.1:8000" + user.avatar);
          }
        }
      } catch (err) {
        console.error("Ошибка при получении профиля:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("first_name", formData.firstName);
    form.append("last_name", formData.lastName);
    form.append("email", formData.email);
    form.append("university", formData.university);
    if (avatarFile) form.append("avatar", avatarFile);

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/profile/", {
        method: "PATCH",
        body: form,
      });

      if (res.ok) {
        setSuccessMessage("Профиль успешно обновлён ✅");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setSuccessMessage("❌ Ошибка при обновлении профиля");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setSuccessMessage("❌ Ошибка при обновлении профиля");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AnimatedPage>
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-white text-sm">
    <Header color="bluepurple" styleType = "floating" onLogout={handleLogout} />
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="pt-[100px]"></div>

      {/* Блок профиля */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-md flex items-center gap-6">
        <div className="relative">
          <label>
            <img
              src={avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow">
              <i className="fas fa-pencil-alt text-purple-600 text-sm"></i>
            </div>
          </label>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
          <p className="opacity-90">{formData.university || "Учебное заведение"}</p>
          <p className="text-sm opacity-70 mt-1">Зарегистрирован: {joinDate}</p>
        </div>
      </div>

      {/* Блок формы */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
          <i className="fas fa-user-circle mr-2"></i> Личная информация
        </h3>

        {successMessage && (
          <div className="mb-4 px-4 py-3 rounded bg-green-100 text-green-800 text-sm text-center font-medium shadow">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <i className="fas fa-user absolute top-3 left-3 text-purple-400"></i>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Имя"
              />
            </div>
            <div className="relative">
              <i className="fas fa-user absolute top-3 left-3 text-purple-400"></i>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Фамилия"
              />
            </div>
          </div>
          <div className="relative">
            <i className="fas fa-envelope absolute top-3 left-3 text-purple-400"></i>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Email"
            />
          </div>
          <div className="relative">
            <i className="fas fa-university absolute top-3 left-3 text-purple-400"></i>
            <input
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="Учебное заведение"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
              Отменить
            </button>
            <button type="submit" className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow hover:opacity-90">
              Сохранить
            </button>
          </div>
        </form>
      </div>

      {/* Блок лекций */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
          <i className="fas fa-book-open mr-2"></i> Мои лекции
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 hover:shadow-lg transition">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-600">История</span>
              <span className="text-xs text-gray-400">2 дня назад</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">События смутного времени</h4>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 hover:shadow-lg transition">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-600">Экономика</span>
              <span className="text-xs text-gray-400">1 неделя назад</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Введение в экономику</h4>
          </div>
        </div>
      </div>

    </div>
  </div>
</AnimatedPage>
  );
};

export default ProfilePage;
