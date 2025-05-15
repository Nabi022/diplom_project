from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, T5ForConditionalGeneration, pipeline
import torch
import random
import re

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Подключение paraphraser
paraphraser_name = "cointegrated/rut5-base-paraphraser"
paraphraser_tokenizer = AutoTokenizer.from_pretrained(paraphraser_name)
paraphraser_model = AutoModelForSeq2SeqLM.from_pretrained(paraphraser_name).to(device)

# Суммаризация
sum_model_name = "cointegrated/rut5-base-absum"
sum_tokenizer = AutoTokenizer.from_pretrained(sum_model_name)
sum_model = AutoModelForSeq2SeqLM.from_pretrained(sum_model_name).to(device)

# Генерация вопросов — прежняя модель
questions_model_name = "hivaze/AAQG-QA-QG-FRED-T5-1.7B"
qg_tokenizer = AutoTokenizer.from_pretrained(questions_model_name)
qg_model = T5ForConditionalGeneration.from_pretrained(questions_model_name).to(device)

# Ответы на вопросы (pipeline)
qa_pipeline = pipeline("question-answering", model="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru", tokenizer="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru", device=0 if torch.cuda.is_available() else -1)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response({"username": request.user.username})

def paraphrase(text):
    prompt = f"paraphrase: {text}"
    input_ids = paraphraser_tokenizer.encode(
        prompt,
        return_tensors="pt",
        max_length=256,
        truncation=True
    ).to(device)

    output_ids = paraphraser_model.generate(
        input_ids=input_ids,
        max_length=256,
        num_beams=5,
        no_repeat_ngram_size=3,
        repetition_penalty=1.5,
        temperature=0.9,
        early_stopping=True
    )

    result = paraphraser_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    result = re.sub(r'^(Комментарий|Параграф|Описание|Пример|Например|Следовательно|В целом)[:,]?\s+', '', result, flags=re.IGNORECASE)
    return result

def summarize_long_text_by_parts(full_text, tokenizer, model, device, level="medium"):
    if level == "short":
        max_len, min_len = 180, 40
    elif level == "long":
        max_len, min_len = 350, 120
    else:
        max_len, min_len = 250, 80

    paragraphs = [p.strip() for p in full_text.split('\n') if p.strip()]
    bullet_points = []

    for paragraph in paragraphs:
        prompt = f"summarize: {paragraph}"

        input_ids = tokenizer.encode(
            prompt,
            return_tensors="pt",
            max_length=1024,
            truncation=True
        ).to(device)

        output_ids = model.generate(
            input_ids=input_ids,
            max_length=max_len,
            min_length=min_len,
            num_beams=5,
            no_repeat_ngram_size=3,
            early_stopping=True
        )

        summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        sentences = re.split(r'(?<=[.!?])\s+', summary.strip())

        for s in sentences:
            if not s.strip():
                continue
            try:
                paraphrased = paraphrase(s.strip())
            except Exception:
                paraphrased = s.strip()

            bullet = f"• {paraphrased[0].upper() + paraphrased[1:]}" if paraphrased and paraphrased[0].islower() else f"• {paraphrased}"
            bullet_points.append(bullet)

    return "\n".join(bullet_points)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def summarize_lecture(request):
    text = request.data.get("text", "")
    level = request.data.get("level", "medium")

    if not text.strip():
        return Response({"error": "Текст не предоставлен"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        bullet_summary = summarize_long_text_by_parts(text, sum_tokenizer, sum_model, device, level)
        return Response({"summary": bullet_summary}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    text = request.data.get("text", "")
    count = int(request.data.get("count", 3))

    if not text.strip():
        return Response({"error": "Текст не предоставлен."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        prompt = f"Сгенерируй вопрос по тексту. Текст: '{text}'"
        input_ids = qg_tokenizer.encode(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)

        output_ids = qg_model.generate(
            input_ids=input_ids,
            max_length=128,
            num_beams=5,
            num_return_sequences=count,
            early_stopping=True,
            no_repeat_ngram_size=2
        )

        questions = []
        for out in output_ids:
            decoded = qg_tokenizer.decode(out, skip_special_tokens=True).strip()
            if decoded:
                questions.append({"question": decoded})

        return Response(questions, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_quiz(request):
    count = int(request.data.get("count", 5))

    all_quiz = [
        {
            "question": "Что такое Интернет?",
            "options": [
                "Глобальная система объединённых компьютерных сетей",
                "Программа для просмотра фильмов",
                "Локальная сеть для школ",
                "Операционная система"
            ],
            "correct": 0
        },
        {
            "question": "Когда появился первый прототип Интернета?",
            "options": [
                "В 1960-х годах",
                "В 2005 году",
                "В 1990-х годах",
                "В 1850 году"
            ],
            "correct": 0
        },
        {
            "question": "Какая технология легла в основу архитектуры Интернета?",
            "options": [
                "TCP/IP",
                "HTTP",
                "Wi-Fi",
                "Bluetooth"
            ],
            "correct": 0
        },
        {
            "question": "Как Интернет используется в здравоохранении?",
            "options": [
                "Для телемедицинских консультаций и обмена данными",
                "Для печати книг",
                "Для создания антивирусов",
                "Только для развлечений"
            ],
            "correct": 0
        },
        {
            "question": "Какие риски связаны с Интернетом?",
            "options": [
                "Киберпреступность и утечки данных",
                "Повышение урожайности",
                "Снижение температуры",
                "Рост населения"
            ],
            "correct": 0
        }
    ]

    return Response(all_quiz[:count], status=status.HTTP_200_OK)





