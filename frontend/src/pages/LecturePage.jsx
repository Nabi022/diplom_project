import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";
import Header from "../pages/Header";
import { authFetch } from "../utils/authFetch";

const LecturePage = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [summaryCharCount, setSummaryCharCount] = useState(0);
  const [useBullets, setUseBullets] = useState(true);
  const [compression, setCompression] = useState("short");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) navigate("/login");
  }, []);

  const getNoun = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  };

  const formatSummary = (text) => {
    if (!text) return <p className="text-gray-500 italic">Здесь появится ваш конспект</p>;
    return (
      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
        {text}
      </div>
    );
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      alert("Пожалуйста, введите текст для конспектирования");
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/summarize/", {
        method: "POST",
        body: JSON.stringify({ title, text, bullets: useBullets, level: compression }),
      });

      const data = await res.json();

      if (res.ok) {
        setSummary(data.summary);
        setSummaryCharCount(
          Array.isArray(data.summary)
            ? data.summary.join(" ").length
            : data.summary.length
        );
      } else {
        alert(data.error || "Произошла ошибка");
      }
    } catch {
      alert("Не удалось сократить текст");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setTitle("");
    setFile(null);
    setSummary("");
    setCharCount(0);
    setSummaryCharCount(0);
  };

  const handleCopy = () => {
    const copyText = Array.isArray(summary) ? summary.join("\n") : summary;
    if (!copyText.trim()) {
      alert("Нет текста для копирования");
      return;
    }
    navigator.clipboard.writeText(copyText)
      .then(() => alert("Конспект скопирован!"))
      .catch(() => alert("Ошибка копирования"));
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-white pt-[100px] text-sm">
        <Header color="bluepurple" styleType="fixed" />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-10">
            <div className="pt-[10px]"></div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-normal leading-snug">
              Конспектирование лекций
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Вставьте лекцию или загрузите файл, и наш алгоритм создаст краткий конспект с ключевыми мыслями
            </p>
          </div>

          <section className="mb-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-info-circle mr-2 text-blue-500"></i>Как это работает?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-500 mb-2 text-2xl"><i className="fas fa-upload"></i></div>
                <h4 className="font-semibold mb-1">1. Вставьте текст</h4>
                <p className="text-gray-600 text-sm">Или загрузите файл (PDF, DOCX, TXT)</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-500 mb-2 text-2xl"><i className="fas fa-cogs"></i></div>
                <h4 className="font-semibold mb-1">2. Обработка</h4>
                <p className="text-gray-600 text-sm">Алгоритм выделит ключевые моменты и сожмёт лекцию.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-blue-500 mb-2 text-2xl"><i className="fas fa-file-download"></i></div>
                <h4 className="font-semibold mb-1">3. Результат</h4>
                <p className="text-gray-600 text-sm">Скопируйте или сохраните результат удобным способом.</p>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название лекции"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-6">
              {/* Textarea */}
              <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-pencil-alt mr-2 text-blue-500"></i>Исходный текст
                </h3>
                <div className="text-sm text-gray-500">
                  {charCount} {getNoun(charCount, "символ", "символа", "символов")}
                </div>
              </div>

              <textarea
                className="w-full h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                placeholder="Вставьте сюда текст лекции..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCharCount(e.target.value.length);
                }}
              />
            </div>

            {/* File upload */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-cloud-upload-alt mr-2 text-blue-500"></i>Загрузите файл
                </h3>
                <div className="text-sm text-gray-400">PDF, DOCX, TXT</div>
              </div>

              <div
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div>
                    <i className="fas fa-file-alt text-4xl text-blue-500 mb-3"></i>
                    <p className="text-gray-700 font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-3"></i>
                    <p className="text-gray-600 mb-2">Перетащите файл или нажмите для загрузки</p>
                    <p className="text-sm text-gray-400">Макс. размер 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>

            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleClear}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    <i className="fas fa-trash-alt mr-2"></i>Очистить
                  </button>
                  <select
                    value={compression}
                    onChange={(e) => setCompression(e.target.value)}
                    className="px-4 py-2 rounded-md border text-gray-700 bg-white shadow-sm"
                  >
                    <option value="short">Коротко</option>
                    <option value="medium">Средне</option>
                    <option value="long">Подробно</option>
                  </select>
                </div>

                <button
                  onClick={handleSummarize}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  <i className="fas fa-magic mr-2"></i>
                  {isLoading ? "Обработка..." : "Создать конспект"}
                </button>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-file-contract mr-2 text-purple-500"></i>Конспект
                </h3>
                <div className="text-sm text-gray-500">
                  {summaryCharCount} {getNoun(summaryCharCount, "символ", "символа", "символов")}
                </div>
              </div>

              <div className="min-h-[150px] max-h-[600px] p-4 border rounded-lg bg-gray-50 overflow-y-auto text-gray-800">
                {isLoading ? (
                  <div className="text-blue-600 animate-pulse">Обработка текста...</div>
                ) : Array.isArray(summary) ? (
                  <ul className="list-disc pl-6 space-y-2">
                    {summary.map((s, i) => (
                      <li key={i}>{s.replace(/^•\s?/, "")}</li>
                    ))}
                  </ul>
                ) : (
                  formatSummary(summary)
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                >
                  <i className="fas fa-copy mr-2"></i>Копировать
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AnimatedPage>
  );
};

export default LecturePage;
