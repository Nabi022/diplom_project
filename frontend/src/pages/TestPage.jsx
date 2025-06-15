import React, { useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";

const TestPage = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [stage, setStage] = useState("upload");
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      dropArea.classList.add("active");
    };
    const handleDragLeave = () => dropArea.classList.remove("active");
    const handleDrop = (e) => {
      e.preventDefault();
      dropArea.classList.remove("active");
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) setFile(droppedFile);
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleGenerate = async () => {
    if (!file && !text.trim()) {
      alert("Пожалуйста, загрузите файл или введите текст лекции");
      return;
    }

    setStage("loading");
    setProgress(30);

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/generate-quiz-gpt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count })
      });

      if (!res.ok) throw new Error("Ошибка при генерации теста");

      const quizData = await res.json();
      setQuiz(quizData);
      setProgress(100);
      setTimeout(() => setStage("results"), 300);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при генерации теста");
      setStage("upload");
    }
  };

  const handleNew = () => {
    setFile(null);
    setText("");
    setCount(5);
    setQuiz([]);
    setStage("upload");
    setProgress(0);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-white pt-10 text-sm">
        <div className="max-w-6xl mx-auto px-4 pb-20 relative">
          <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-extrabold text-purple-700 flex items-center gap-3">
              <i className="fas fa-graduation-cap text-purple-600 text-3xl"></i>
              <span className="tracking-tight">SmartLectures</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium text-purple-600 hover:text-white bg-white/50 hover:bg-purple-500 border border-purple-100 rounded-xl px-4 py-1.5 shadow backdrop-blur-sm transition"
            >
              <i className="fas fa-arrow-left text-500"></i>
              На главную
          </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Генерация теста
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Загрузите материалы лекции и получите автоматически сгенерированный тест
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                <i className="fas fa-upload text-purple-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Вставьте текст</h4>
                <p className="text-gray-500 text-sm">Загрузите файл или вставьте текст лекции</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                <i className="fas fa-cogs text-purple-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Обработка</h4>
                <p className="text-gray-500 text-sm">Алгоритм сгенерирует тест</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                <i className="fas fa-download text-purple-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Результат</h4>
                <p className="text-gray-500 text-sm">Пройдите и проверьте себя</p>
              </div>
            </div>

            {stage === "loading" && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
                <i className="fas fa-cog fa-spin text-4xl text-purple-600 mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Генерация теста</h2>
                <p className="text-gray-500 mb-4">Это может занять несколько секунд...</p>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Введите название лекции"
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Вставьте текст лекции здесь..."
                />
              </div>

              <div
                ref={dropRef}
                className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div>
                    <i className="fas fa-file-alt text-4xl text-purple-500 mb-3"></i>
                    <p className="text-gray-700 font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-4xl text-purple-500 mb-3"></i>
                    <p className="text-gray-600 mb-2">Перетащите файл или нажмите для загрузки</p>
                    <p className="text-sm text-gray-400">PDF, DOCX, TXT, макс. 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
          {/* Переключатель кол-ва вопросов */}
          <div className="flex items-center gap-3">
            <label className="text-gray-700 font-semibold text-sm whitespace-nowrap">
              Количество вопросов:
            </label>

            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden">
              <button
                onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 20) setCount(val);
                }}
                className="w-14 text-center font-medium text-gray-800 border-x border-gray-200 outline-none"
              />
              <button
                onClick={() => setCount((prev) => Math.min(20, prev + 1))}
                className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>

            <span className="text-xs text-gray-400">от 1 до 20</span>
          </div>

          {/* Кнопка генерации */}
          <button
            onClick={handleGenerate}
            className="ml-auto md:mr-[12%] bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2"
          >
            <i className="fas fa-pen"></i>
            Сгенерировать тест
          </button>
        </div>

            {stage === "results" && (
              <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <i className="fas fa-check-circle text-3xl text-purple-600"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Пройдите тест</h2>
                  <p className="text-gray-500">Выберите варианты ответов и проверьте себя</p>
                </div>
                <div className="space-y-6">
                  {quiz.map((q, i) => (
                    <QuestionBlock key={i} question={q} index={i} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={handleNew}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-2 px-6 rounded-lg"
                  >
                    <i className="fas fa-redo mr-2"></i> Новый файл
                  </button>
                </div>
              </div>
            )}

            <div className="pt-12"></div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

const QuestionBlock = ({ question, index }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        {index + 1}. {question.question_text}
      </h3>
      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correct_index;
          const isSelected = i === selected;

          let className = "block w-full text-left px-4 py-2 rounded-lg border transition";

          if (selected != null) {
            className += isCorrect
              ? " border-green-500 bg-green-100 text-green-700 font-semibold"
              : isSelected
              ? " border-red-500 bg-red-100 text-red-700"
              : " border-gray-200 bg-white";
          } else {
            className += " border-gray-200 bg-white hover:bg-purple-50";
          }

          return (
            <li key={i}>
              <button
                className={className}
                onClick={() => setSelected(i)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {selected != null && (
        <p className="mt-3 font-medium">
          {selected === question.correct_index ? (
            <span className="text-green-600">✅ Верно</span>
          ) : (
            <span className="text-red-600">❌ Неверно</span>
          )}
        </p>
      )}
    </div>
  );
};

export default TestPage;
