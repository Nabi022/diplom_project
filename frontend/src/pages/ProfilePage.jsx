import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";
import AnimatedPage from "../pages/AnimatedPage";
import { authFetch } from "../utils/authFetch";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

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
  const [lectures, setLectures] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  const performanceData = [
  { date: "14.06", value: 3 },
  { date: "15.06", value: 2 },
  { date: "16.06", value: 4 },
  { date: "17.06", value: 3 },
  { date: "18.06", value: 2 },
];


  const pieData = [
    { name: "Пройдено", value: 7 },
    { name: "Провалено", value: 1 },
  ];

  const COLORS = ["#8b5cf6", "#f87171"];

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

    const fetchLectures = async () => {
      try {
        const res = await authFetch("http://127.0.0.1:8000/api/user_lectures/");
        if (res.ok) {
          const data = await res.json();
          setLectures(data);
        } else {
          console.error("Ошибка при загрузке лекций", await res.text());
        }
      } catch (err) {
        console.error("Ошибка при загрузке лекций:", err);
      }
    };

    fetchProfile();
    fetchLectures();
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
        setIsEditing(false);
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

  const handleDeleteLecture = async (id) => {
  if (!window.confirm("Вы уверены, что хотите удалить лекцию?")) return;

  try {
    const res = await authFetch(`http://127.0.0.1:8000/api/delete_lecture/${id}/`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLectures((prev) => prev.filter((lecture) => lecture.id !== id));
    } else {
      console.error("Ошибка при удалении:", await res.text());
    }
  } catch (err) {
    console.error("Ошибка при удалении:", err);
  }
};
const getFormatLabel = (format) => {
  if (format === "тезисы" || format === "абзацы") return "Конспект";
  return format.charAt(0).toUpperCase() + format.slice(1);
};

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-white text-sm">
        <Header color="bluepurple" styleType="floating" onLogout={handleLogout} />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="pt-[100px]"></div>

          {/* Блок профиля */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-md flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
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

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-48 px-4 py-2 text-purple-700 font-semibold bg-white rounded-lg shadow hover:bg-purple-100 border border-purple-700"
              >
                {isEditing ? "Закрыть" : "Редактировать"}
              </button>
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className="w-48 px-4 py-2 text-purple-700 font-semibold bg-white rounded-lg shadow hover:bg-purple-100 border border-purple-700 flex items-center justify-center gap-2"
              >
                <i className="fas fa-chart-line text-purple-600"></i>
                Моя успеваемость
              </button>
            </div>
          </div>


          {/* Кнопка и форма успеваемости */}
          {showPerformance && (
          <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
            {/* Заголовок */}
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Ваша успеваемость</h3>
            </div>

            {/* Основные цифры */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <i className="fas fa-book text-lg"></i>
                  <span className="text-2xl font-bold">5</span>
                </div>
                <p className="text-sm text-gray-500">Конспектов</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <i className="fas fa-question-circle text-lg"></i>
                  <span className="text-2xl font-bold">18</span>
                </div>
                <p className="text-sm text-gray-500">Сгенерировано всего</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                  <i className="fas fa-check-circle text-lg"></i>
                  <span className="text-2xl font-bold">7</span>
                </div>
                <p className="text-sm text-gray-500">Тестов пройдено</p>
              </div>
              <div>
                <div className="text-purple-600 mb-1">
                  <span className="text-2xl font-bold">80%</span>
                </div>
                <p className="text-sm text-gray-500">Средний результат</p>
              </div>
            </div>

            {/* График */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Активность по дням</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={performanceData}
                  barSize={60}
                  barGap={8}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

          {/* Блок редактирования */}
          {isEditing && (
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

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Отменить
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow hover:opacity-90"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Блок лекций */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <i className="fas fa-book-open text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Мои лекции</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lectures.length === 0 ? (
                <p className="text-gray-500">У вас пока нет сохранённых лекций.</p>
              ) : (
                lectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-600 capitalize">
                      {getFormatLabel(lecture.format || "лекция")}
                    </span>
                      <span className="text-xs text-gray-400">
                        {new Date(lecture.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{lecture.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {lecture.summaries?.[0]?.summary_text || lecture.content || ""}
                    </p>
                    <button
                      onClick={() => navigate(`/lecture/${lecture.id}`)}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Открыть →
                    </button>
                    <button
                      onClick={() => handleDeleteLecture(lecture.id)}
                      className="mt-2 text-sm text-red-600 hover:underline ml-2"
                    >
                      Удалить ✖
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ProfilePage;
