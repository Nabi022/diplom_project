import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  useEffect(() => {
    const featureCards = document.querySelectorAll(".feature-card");
    const timelineItems = document.querySelectorAll(".timeline-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    featureCards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(card);
    });

    timelineItems.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-20px)";
      item.style.transition = `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`;

      const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
          }
        });
      }, { threshold: 0.1 });

      itemObserver.observe(item);
    });
  }, []);

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50">
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        }
        .wave-shape {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }
        .wave-shape svg {
          position: relative;
          display: block;
          width: calc(100% + 1.3px);
          height: 150px;
        }
        .wave-shape .shape-fill {
          fill: #FFFFFF;
        }
        .timeline-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 24px;
          top: 40px;
          height: calc(100% - 40px);
          width: 2px;
          background: #a777e3;
        }
        .glass-footer {
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .glow-text {
          text-shadow: 0 0 8px rgba(167, 119, 227, 0.6);
        }
        .hover-grow {
          transition: transform 0.3s ease;
        }
        .hover-grow:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Header */}
<header className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-b-[60px] shadow-lg">
  <div className="container mx-auto px-6 pt-6 pb-24 md:pb-32 relative z-10">

    {/* Логотип и центрированное меню */}
    <div className="relative flex items-center justify-between">
      {/* Логотип слева */}
      <div className="flex items-center space-x-2 hover-grow">
  <i className="fas fa-graduation-cap text-2xl"></i>
  <span className="text-xl font-bold">SmartLectures</span>
</div>

      {/* Центрированная навигация */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
        <a href="/" className="hover:text-gray-200 transition">Главная</a>
        <a href="/about" className="font-semibold underline">О нас</a>
        <a href="#contacts" className="hover:text-gray-200 transition">Контакты</a>
      </div>
    </div>

    {/* Заголовок с анимацией */}
    <div className="mt-24 md:mt-32 text-center">
      <h1
        className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-white drop-shadow-md"
        data-aos="fade-up"
      >
        Забудь о рутине — <span className="underline decoration-white/30 decoration-4">включай интеллект</span>
      </h1>
      <p
        className="text-xl md:text-2xl max-w-3xl mx-auto"
        data-aos="fade-up"
        data-aos-delay="150"
      >
        Мы автоматизируем скучное. Ты фокусируешься на настоящем прогрессе.
      </p>
    </div>
  </div>
</header>


      {/* Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Что такое SmartLectures?</h2>
              <p className="text-lg mb-6">
                Это дипломный проект, который автоматизирует процесс обучения: от конспектов до тестов.
              </p>
              <p className="text-lg">
                Используются технологии NLP для генерации учебных материалов.
              </p>
            </div>
            <div className="md:w-1/2 hover-grow">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80"
                alt="Студенты"
                className="rounded-xl shadow-xl w-full h-auto transition hover:shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50" id="features">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши ключевые возможности</h2>
          <p className="text-xl text-gray-600 mb-12">
            Инновационные функции, которые делают обучение эффективнее
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "fa-file-alt",
                title: "Автоконспектирование",
                desc: "Создание структурированных конспектов из текста лекций.",
              },
              {
                icon: "fa-question-circle",
                title: "Контрольные вопросы",
                desc: "Генерация вопросов по тексту для самопроверки.",
              },
              {
                icon: "fa-tasks",
                title: "Автоматические тесты",
                desc: "Создание тестов с вариантами ответов и правильным выбором.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="feature-card bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover-grow"
              >
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-6 text-white text-2xl">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">История разработки</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
            Путь создания SmartLectures как дипломного проекта
          </p>
          <div className="max-w-3xl mx-auto">
            {[
              ["fa-lightbulb", "Идея", "Желание упростить обучение и сократить рутину."],
              ["fa-search", "Исследование", "Анализ решений и изучение NLP."],
              ["fa-code", "Разработка", "Реализация ядра системы и интерфейса."],
              ["fa-rocket", "Запуск", "Тестирование и подготовка к защите."],
            ].map(([icon, title, desc], i) => (
              <div
                key={i}
                className="relative timeline-item pl-16 pb-12 text-left"
              >
                <div className="absolute left-0 w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white hover-grow">
                  <i className={`fas ${icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Создатель проекта</h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">Один человек – множество идей</p>
    </div>

    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-500">
      <div className="md:flex">
        <div className="md:shrink-0">
          <img
            className="h-48 w-full md:h-full md:w-48 object-cover"
            src="/photo_2023-09-17_21-53-17.jpg" // путь зависит от проекта
            alt="Создатель проекта"
          />
        </div>
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Разработчик</div>
          <p className="block mt-1 text-lg leading-tight font-medium text-black">Студент-выпускник</p>
          <p className="mt-2 text-gray-500">
            Автор идеи и разработчик всей системы. Объединил знания в области программирования и педагогики для создания инновационного решения.
          </p>
          <div className="mt-4 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-indigo-500 transition"><i className="fab fa-github"></i></a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="text-gray-400 hover:text-red-500 transition"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<section className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 text-white text-center px-6 py-16 mt-16 mb-32 rounded-3xl shadow-lg max-w-7xl mx-auto">
  <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы попробовать?</h2>
  <p className="text-lg mb-8 max-w-2xl mx-auto">
    Начните использовать SmartLectures уже сегодня и измените свой подход к обучению!
  </p>
  <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300 hover-grow">
    Начать бесплатно
  </button>
</section>


<footer id="contacts" className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white py-12">
  <div className="container mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between">
      <div className="mb-8 md:mb-0">
        <div className="flex items-center space-x-2 mb-4">
          <i className="fas fa-graduation-cap text-2xl text-white"></i>
          <span className="text-xl font-bold text-white">SmartLectures</span>
        </div>
        <p className="max-w-xs opacity-90 text-white">
          Платформа для автоматического создания учебных материалов.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Навигация</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-gray-200 transition">Главная</a></li>
            <li><a href="/#features" className="hover:text-gray-200 transition">Функции</a></li>
            <li><a href="/about" className="hover:text-gray-200 transition">О нас</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Контакты</h3>
          <ul className="space-y-2 text-white">
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

export default AboutPage;
