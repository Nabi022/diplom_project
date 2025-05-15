import React, { useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import Header from "../pages/Header";
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

  useEffect(() => {
    const dropArea = dropRef.current;
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
      const response = await authFetch("http://127.0.0.1:8000/api/questions/", {
        method: "POST",
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
    setQuestionCount(5);
    setQuestions([]);
    setStage("upload");
    setProgress(0);
  };

  return (
    <AnimatedPage>
      <div className="bg-gray-50 min-h-screen pt-0">
        <Header color="green" />
        <div className="max-w-6xl mx-auto mt-16 text-center animate-fade-in font-sans px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-normal leading-snug">
            Генерация контрольных вопросов
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Загрузите материалы лекции и получите автоматически сгенерированные вопросы
          </p>

          <div className="bg-green-50 rounded-xl px-6 py-6 border border-green-100 mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
              <i className="fas fa-info-circle mr-2 text-green-500"></i>Как это работает?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-green-500 mb-2 text-2xl"><i className="fas fa-upload"></i></div>
                <h4 className="font-semibold mb-1">1. Вставьте текст</h4>
                <p className="text-gray-600 text-sm">Загрузите файл или вставьте текст лекции.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-green-500 mb-2 text-2xl"><i className="fas fa-cogs"></i></div>
                <h4 className="font-semibold mb-1">2. Обработка</h4>
                <p className="text-gray-600 text-sm">Алгоритм сгенерирует контрольные вопросы.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-green-500 mb-2 text-2xl"><i className="fas fa-file-download"></i></div>
                <h4 className="font-semibold mb-1">3. Результат</h4>
                <p className="text-gray-600 text-sm">Сохраните или скопируйте полученные вопросы.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md max-w-6xl mx-auto mb-16">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Генерация вопросов</h1>
            <p className="text-gray-500 text-center mb-8">
              Загрузите материалы лекции и получите автоматически сгенерированные вопросы
            </p>

            {stage === "loading" && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
                <i className="fas fa-cog fa-spin text-4xl text-green-600 mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Генерация вопросов</h2>
                <p className="text-gray-500 mb-4">Это может занять несколько секунд...</p>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Вставьте текст лекции здесь..."
                />
              </div>

              <div
                ref={dropRef}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => fileInputRef.current.click()}
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

            <div className="flex flex-col items-center gap-4">
              <label className="text-gray-700 font-medium mb-1 text-center">Количество вопросов:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full max-w-xs border border-gray-300 rounded px-4 py-2 text-center focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-3 px-10 rounded-lg shadow-md hover:opacity-90 transition w-full max-w-xs"
              >
                <i className="fas fa-pen mr-2"></i>Сгенерировать вопросы
              </button>
            </div>
          </div>

          {stage === "results" && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
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
                      {i + 1}. {typeof q === "object" && q.question ? q.question : "Вопрос не найден."}
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
        </div>
      </div>
    </AnimatedPage>
  );
};

export default QuestionsPage;
