import React, { useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";

const QuestionsPage = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [stage, setStage] = useState("upload");
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [title, setTitle] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [lectureId, setLectureId] = useState(null);
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
      const summarizeRes = await authFetch("http://127.0.0.1:8000/api/summarize-gpt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title }),
      });

      if (!summarizeRes.ok) throw new Error("Ошибка при создании лекции");
      const lecture = await summarizeRes.json();
      setSummaryText(lecture.summary_text);
      setLectureId(lecture.lecture.id);
      setProgress(60);

      const response = await authFetch("http://127.0.0.1:8000/api/generate-questions-gpt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count: questionCount }),
      });

      if (!response.ok) throw new Error("Ошибка при генерации вопросов");
      const data = await response.json();
      setQuestions(data);
      setProgress(100);
      setTimeout(() => setStage("results"), 300);
    } catch (error) {
      console.error("Ошибка при генерации вопросов:", error);
      alert("Ошибка при генерации вопросов");
      setStage("upload");
    }
  };

  const handleNew = () => {
    setFile(null);
    setText("");
    setTitle("");
    setSummaryText("");
    setLectureId(null);
    setQuestionCount(5);
    setQuestions([]);
    setStage("upload");
    setProgress(0);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-white pt-10 text-sm">
        <div className="max-w-6xl mx-auto px-4 pb-20 relative">
          <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-extrabold text-green-700 flex items-center gap-3">
              <i className="fas fa-graduation-cap text-green-600 text-3xl"></i>
              <span className="tracking-tight">SmartLectures</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium text-green-600 hover:text-white bg-white/50 hover:bg-green-500 border border-green-100 rounded-xl px-4 py-1.5 shadow backdrop-blur-sm transition"
            >
              <i className="fas fa-arrow-left text-green-500"></i>
              На главную
          </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Генерация контрольных вопросов
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Загрузите текст лекции или файл, и получите вопросы автоматически
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <i className="fas fa-upload text-green-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Вставьте текст</h4>
                <p className="text-gray-500 text-sm">Загрузите файл или вставьте текст</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <i className="fas fa-cogs text-green-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Обработка</h4>
                <p className="text-gray-500 text-sm">Алгоритм сформирует вопросы</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                <i className="fas fa-check text-green-500 text-2xl mb-2"></i>
                <h4 className="font-semibold">Результат</h4>
                <p className="text-gray-500 text-sm">Сохраните или скопируйте вопросы</p>
              </div>
            </div>

            {stage === "loading" && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
                <i className="fas fa-cog fa-spin text-4xl text-green-600 mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Генерация вопросов</h2>
                <p className="text-gray-500 mb-4">Это может занять несколько секунд...</p>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Введите название лекции"
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Вставьте текст лекции здесь..."
                />
              </div>

              <div
                ref={dropRef}
                className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div>
                    <i className="fas fa-file-alt text-4xl text-green-500 mb-3"></i>
                    <p className="text-gray-700 font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-4xl text-green-500 mb-3"></i>
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
              {/* Кол-во вопросов */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                  Количество вопросов:
                </label>

                <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuestionCount((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={questionCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= 20) setQuestionCount(val);
                    }}
                    className="w-14 text-center font-medium text-gray-800 border-x border-gray-200 outline-none"
                  />
                  <button
                    onClick={() => setQuestionCount((prev) => Math.min(20, prev + 1))}
                    className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs text-gray-400">от 1 до 20</span>
              </div>

              {/* Кнопка */}
              <button
                onClick={handleGenerate}
                className="ml-auto md:mr-[12%] bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <i className="fas fa-edit"></i>
                Сгенерировать вопросы
              </button>
            </div>

            {stage === "results" && (
              <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <i className="fas fa-check-circle text-3xl text-green-600"></i>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Вопросы готовы!</h2>
                  <p className="text-gray-500">Вот что мы подготовили на основе ваших материалов</p>
                </div>
                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <p className="text-gray-800 text-lg">
                        {i + 1}. {typeof q === "object" && q.question_text ? q.question_text : "Вопрос не найден."}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={handleNew}
                    className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-6 rounded-lg"
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

export default QuestionsPage;
