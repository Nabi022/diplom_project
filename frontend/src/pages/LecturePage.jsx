import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";
import Header from "../pages/Header";

const LecturePage = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [summaryCharCount, setSummaryCharCount] = useState(0);
  const [useBullets, setUseBullets] = useState(true);
  const [compression, setCompression] = useState("short");
  const navigate = useNavigate();

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
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/summarize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, bullets: useBullets, level: compression }),
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
      <div className="bg-gray-50 min-h-screen">
        <Header color="bluepurple" />

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-normal leading-snug">
              Конспектирование лекций
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Вставьте лекцию, и наш алгоритм создаст краткий конспект с ключевыми мыслями
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
                <p className="text-gray-600 text-sm">Вставьте любой текст, который нужно сократить.</p>
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
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-6 border-r border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-pencil-alt mr-2 text-blue-500"></i>Исходный текст
                  </h3>
                  <div className="text-sm text-gray-500">
                    {charCount} {getNoun(charCount, "символ", "символа", "символов")}
                  </div>
                </div>
                <textarea
                  className="w-full h-64 p-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Вставьте сюда текст лекции..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                />
                <div className="mt-4 flex justify-between flex-wrap gap-3 items-center">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleClear}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      <i className="fas fa-trash-alt mr-2"></i>Очистить
                    </button>
                    <select
                      value={compression}
                      onChange={(e) => setCompression(e.target.value)}
                      className="px-3 py-2 rounded-md border text-gray-700 bg-white shadow-sm"
                    >
                      <option value="short">Коротко</option>
                      <option value="medium">Средне</option>
                      <option value="long">Подробно</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                  >
                    <i className="fas fa-magic mr-2"></i>
                    {isLoading ? "Обработка..." : "Создать конспект"}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-file-contract mr-2 text-purple-500"></i>Конспект
                  </h3>
                  <div className="text-sm text-gray-500">
                    {summaryCharCount} {getNoun(summaryCharCount, "символ", "символа", "символов")}
                  </div>
                </div>
                <div className="min-h-[256px] p-4 border rounded-lg bg-gray-50 overflow-auto text-gray-800">
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
          </div>
        </main>
      </div>
    </AnimatedPage>
  );
};

export default LecturePage;
