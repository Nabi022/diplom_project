import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";
import { authFetch } from "../utils/authFetch";

const LecturePage = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [summaryCharCount, setSummaryCharCount] = useState(0);
  const [compression, setCompression] = useState("short");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [outputFormat, setOutputFormat] = useState("bullet"); // bullet | paragraph


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

  if (outputFormat === "bullet") {
    const lines = Array.isArray(text)
      ? text
      : text.split(/\n|•/).map((line) => line.trim()).filter(Boolean);
    return (
      <ul className="list-disc pl-6 space-y-2 text-left text-gray-800 leading-relaxed">
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^•\s?/, "")}</li>
        ))}
      </ul>
    );
  }

  // Абзацами
  const paragraph = Array.isArray(text) ? text.join("\n\n") : text;
  return (
    <div className="whitespace-pre-line text-gray-800 leading-relaxed text-justify">
      {paragraph}
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
      const res = await authFetch("http://127.0.0.1:8000/api/summarize-gpt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, level: compression }),
      });

      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary_text);
        setSummaryCharCount(Array.isArray(data.summary_text)
          ? data.summary_text.join(" ").length
          : data.summary_text.length);
      } else {
        alert(data.error || "Произошла ошибка при генерации");
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

  const handleSaveLecture = async () => {
    if (!title.trim() || !text.trim() || !summary.trim()) {
      alert("Заполните все поля и сгенерируйте конспект перед сохранением");
      return;
    }

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/save_lecture/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          text,
          summary,
          format: "тезисы"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Лекция успешно сохранена");
      } else {
        alert(data.error || "Ошибка при сохранении лекции");
      }
    } catch {
      alert("Сервер не отвечает");
    }
  };

 return (
  <AnimatedPage>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-white pt-10 text-sm">
      <div className="max-w-6xl mx-auto px-4 pb-20 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-extrabold text-blue-700 flex items-center gap-3">
              <i className="fas fa-graduation-cap text-blue-600 text-3xl"></i>
              <span className="tracking-tight">SmartLectures</span>
            </div>

          что
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Конспектирование лекций
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Вставьте текст лекции или загрузите файл – и получите краткий конспект
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
              <i className="fas fa-upload text-blue-500 text-2xl mb-2"></i>
              <h4 className="font-semibold">Вставьте текст</h4>
              <p className="text-gray-500 text-sm">Или загрузите файл лекции</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
              <i className="fas fa-cogs text-blue-500 text-2xl mb-2"></i>
              <h4 className="font-semibold">Обработка</h4>
              <p className="text-gray-500 text-sm">Алгоритм сформирует краткий конспект</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
              <i className="fas fa-download text-blue-500 text-2xl mb-2"></i>
              <h4 className="font-semibold">Результат</h4>
              <p className="text-gray-500 text-sm">Скопируйте или сохраните результат</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6 items-stretch">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-pencil-alt mr-2 text-blue-500"></i>Исходный текст
                </h3>
                <span className="text-sm text-gray-500">
                  {charCount} {getNoun(charCount, "символ", "символа", "символов")}
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                className="flex-grow min-h-[240px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                placeholder="Вставьте текст лекции здесь..."
              />
            </div>

            <div
              ref={fileInputRef}
              className="flex flex-col justify-center items-center border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors min-h-[240px]"
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
                  <p className="text-sm text-gray-400">PDF, DOCX, TXT, макс. 10MB</p>
                </>
              )}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={compression}
                onChange={(e) => setCompression(e.target.value)}
                className="border border-blue-300 text-blue-700 font-medium rounded-lg px-4 py-2 bg-white shadow-sm hover:border-blue-500 transition focus:ring-2 focus:ring-blue-300"
              >
                <option value="short">⚡ Коротко</option>
                <option value="medium">📘 Средне</option>
                <option value="long">📖 Подробно</option>
              </select>

              <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-lg px-2 py-1 shadow-sm">
                <label className="text-sm font-medium text-gray-700">Формат:</label>
                <button
                  onClick={() => setOutputFormat("bullet")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    outputFormat === "bullet"
                      ? "bg-blue-500 text-white"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition`}
                >
                  Тезисы
                </button>
                <button
                  onClick={() => setOutputFormat("paragraph")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    outputFormat === "paragraph"
                      ? "bg-blue-500 text-white"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition`}
                >
                  Абзацы
                </button>
              </div>
            </div>

            <button
              onClick={handleSummarize}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-10 rounded-lg shadow-md hover:opacity-90 transition w-full md:w-auto"
            >
              <i className="fas fa-magic mr-2"></i>Создать конспект
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fas fa-file-contract mr-2 text-indigo-500"></i>Конспект
              </h3>
              <span className="text-sm text-gray-500">
                {summaryCharCount} {getNoun(summaryCharCount, "символ", "символа", "символов")}
              </span>
            </div>
            <div className="min-h-[150px] max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <p className="text-blue-600 animate-pulse">Обработка текста...</p>
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

            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                <i className="fas fa-copy mr-2"></i>Копировать
              </button>
              <button
                onClick={handleSaveLecture}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                <i className="fas fa-save mr-2"></i>Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AnimatedPage>
);
};

export default LecturePage;
