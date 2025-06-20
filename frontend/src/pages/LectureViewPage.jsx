import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AnimatedPage from "../pages/AnimatedPage";
import { authFetch } from "../utils/authFetch";
import pdfMake from "../utils/pdfInit";

const LectureViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/api/lecture/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setLecture(data);
        }
      } catch (err) {
        console.error("Ошибка при загрузке лекции:", err);
      }
    };

    fetchLecture();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!lecture) {
      alert("Лекция не загружена");
      return;
    }

    const docDefinition = {
      content: [
        { text: `Лекция: ${lecture.title || "Без названия"}`, style: "header" },
        { text: "Исходный текст", style: "subheader", margin: [0, 10, 0, 5] },
        { text: lecture.text || "Нет исходного текста", style: "body" },
        { text: "Результат генерации", style: "subheader", margin: [0, 10, 0, 5] },
        { text: lecture.summary || "Нет результата генерации", style: "body" },
      ],
      defaultStyle: { font: "Roboto" },
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 14, bold: true },
        body: { fontSize: 12 },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${lecture.title || "lecture"}.pdf`);
  };

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Лекция не найдена
      </div>
    );
  }

  const summary = {
    summary_text: lecture.summary,
    format: lecture.format,
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-white px-4 pt-28 pb-16">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow border">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{lecture.title}</h1>
            <button
              onClick={() => navigate("/profile")}
              className="text-sm text-purple-600 hover:underline"
            >
              ← Назад в профиль
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Тип:{" "}
            <span className="font-medium text-purple-600">
              {summary?.format || "лекция"}
            </span>{" "}
            | Дата: {new Date(lecture.created_at).toLocaleDateString()}
          </p>

          <h2 className="text-lg font-semibold mb-2">Текст лекции</h2>
          <p className="whitespace-pre-line text-gray-700 mb-6">{lecture.text}</p>

          <button
            onClick={() => setShowSummary((prev) => !prev)}
            className="mb-4 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium px-4 py-2 rounded"
          >
            {showSummary ? "Скрыть результат" : "Показать результат генерации"}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="mb-4 ml-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded"
          >
            Скачать PDF
          </button>

          {showSummary && summary && (
            <div className="bg-gray-50 p-4 border rounded-lg">
              {summary.format === "тест" ? (
                JSON.parse(summary.summary_text).map((q, i) => (
                  <div key={i} className="mb-4">
                    <p className="font-semibold">
                      {i + 1}. {q.question_text}
                    </p>
                    <ul className="pl-4 list-disc text-sm text-gray-700 mt-1">
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={
                            j === q.correct_index
                              ? "text-green-600 font-semibold"
                              : "text-gray-700"
                          }
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <pre className="text-gray-700 whitespace-pre-wrap">
                  {summary.summary_text}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LectureViewPage;
