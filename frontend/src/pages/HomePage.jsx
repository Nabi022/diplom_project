import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Гость";
  const [visibleCards, setVisibleCards] = useState([]);

  const cards = [
    {
      title: "Конспектирование лекций",
      description: "Автоматически создавайте четкие и структурированные конспекты из ваших лекций.",
      icon: "fa-book-open",
      color: "blue",
      to: "/lecture",
    },
    {
      title: "Контрольные вопросы",
      description: "Генерируйте релевантные вопросы по материалам лекций для самопроверки и подготовки к экзаменам.",
      icon: "fa-question-circle",
      color: "green",
      to: "/questions",
    },
    {
      title: "Генерация тестов",
      description: "Создавайте персонализированные тесты с вариантами ответов для эффективной подготовки.",
      icon: "fa-tasks",
      color: "purple",
      to: "/test",
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000 });
    let timeouts = [];
    cards.forEach((_, index) => {
      const t = setTimeout(() => {
        setVisibleCards((prev) => [...prev, index]);
      }, index * 200);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="font-sans bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white pb-10 rounded-b-[60px] shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer">
            <i className="fas fa-graduation-cap text-2xl"></i>
            <span className="text-xl font-bold">SmartLectures</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <span onClick={() => navigate("/")} className="hover:text-gray-200 transition cursor-pointer">Главная</span>
            <span onClick={() => navigate("/about")} className="hover:text-gray-200 transition cursor-pointer">О сайте</span>
            <span className="hover:text-gray-200 transition cursor-pointer">Контакты</span>
          </nav>
         <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-white font-medium">
            {localStorage.getItem("username") || "Гость"}
          </span>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full bg-white text-blue-600 font-semibold hover:bg-blue-100 transition"
          >
            Выход
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-full bg-blue-700 hover:bg-blue-600 transition"
          >
            <i className="fas fa-user text-white"></i>
          </button>
        </div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-wide mb-6 drop-shadow-sm" data-aos="fade-up">
            Платформа автоматизации учебного процесса 
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="150">
            Автоматизируйте процесс обучения с помощью искусственного интеллекта
          </p>
          <div className="flex justify-center space-x-4 mt-10" data-aos="fade-up" data-aos-delay="300">
            <button
              onClick={() => navigate("/lecture")}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition"
            >
              Начать сейчас
            </button>
            <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-blue-700 transition">
              Узнать больше
            </button>
          </div>
        </div>
      </section>


      {/* Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Наши инструменты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.to)}
                className={`relative rounded-xl border border-gray-100 shadow-lg p-6 pt-12 transition duration-500 transform ${
                  visibleCards.includes(index)
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-6 scale-95"
                } cursor-pointer hover:shadow-2xl hover:-translate-y-2`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl ${
                    card.color === "blue"
                      ? "bg-blue-500"
                      : card.color === "green"
                      ? "bg-green-500"
                      : card.color === "purple"
                      ? "bg-purple-500"
                      : "bg-gray-200"
                  }`}
                />
                <div className="card-icon bg-opacity-20 bg-gray-100 mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-md -mt-12 mb-6">
                  <i className={`fas ${card.icon} text-3xl text-${card.color}-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3 text-gray-800">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">{card.description}</p>
                <div className="flex justify-center">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:opacity-90 transition shadow-md">
                    Попробовать <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="py-20 bg-gray-50">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
      Как пользоваться сервисом
    </h2>
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
      {/* Шаг 1 */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/3 text-center hover:shadow-xl transition">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg mx-auto mb-4">
          1
        </div>
        <h3 className="text-xl font-semibold mb-2">Загрузите материалы</h3>
        <p className="text-gray-600">Вставьте текст лекции, статьи или заметки.</p>
      </div>

      {/* Стрелка */}
      <div className="hidden md:block text-gray-400 text-2xl">
        <i className="fas fa-arrow-right"></i>
      </div>

      {/* Шаг 2 */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/3 text-center hover:shadow-xl transition">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg mx-auto mb-4">
          2
        </div>
        <h3 className="text-xl font-semibold mb-2">Выберите инструмент</h3>
        <p className="text-gray-600">Конспект, вопросы или тест — выбирайте то, что нужно.</p>
      </div>

      {/* Стрелка */}
      <div className="hidden md:block text-gray-400 text-2xl">
        <i className="fas fa-arrow-right"></i>
      </div>

      {/* Шаг 3 */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/3 text-center hover:shadow-xl transition">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg mx-auto mb-4">
          3
        </div>
        <h3 className="text-xl font-semibold mb-2">Получите результат</h3>
        <p className="text-gray-600">Скопируйте, скачайте или просто изучите результат.</p>
      </div>
    </div>
  </div>
</section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 text-white text-center px-6 py-16 mt-16 mb-16 rounded-3xl shadow-lg max-w-7xl mx-auto">
  <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы улучшить свой учебный процесс?</h2>
  <p className="text-lg mb-8 max-w-2xl mx-auto">
    Начните использовать SmartLectures уже сегодня и измените свой подход к обучению!
  </p>
  <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300 hover-grow">
    Зарегистрироваться
  </button>
</section>


<footer id="contacts" className="bg-white text-purple-600 py-12">
  <div className="container mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between">
      <div className="mb-8 md:mb-0">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-graduation-cap text-2xl"></i>
          <span className="text-xl font-bold">SmartLectures</span>
        </div>
        <p className="max-w-xs opacity-90">
          Платформа для автоматического создания учебных материалов.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Навигация</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-gray-300 transition">Главная</a></li>
            <li><a href="/#features" className="hover:text-gray-300 transition">Функции</a></li>
            <li><a href="/about" className="hover:text-gray-300 transition">О нас</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Контакты</h3>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <i className="fas fa-envelope"></i>
              <span>nabiumarov02@gmail.com</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-phone"></i>
              <span>+7 (923) 351 13-29</span>
            </li>
            <li className="flex items-center space-x-2">
              <i className="fas fa-map-marker-alt"></i>
              <span>Россия</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="border-t border-white border-opacity-20 mt-12 pt-8 text-center text-sm opacity-90">
      © {new Date().getFullYear()} SmartLectures. Все права защищены.
    </div>
  </div>
</footer>
    </div>
  );
};

export default HomePage;
