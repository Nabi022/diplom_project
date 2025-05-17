from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, T5ForConditionalGeneration, pipeline
import torch
import random
import re
from .models import Lecture, Question, Quiz
from .serializers import LectureSerializer, QuestionSerializer, QuizSerializer
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Подключение paraphraser
paraphraser_name = "cointegrated/rut5-base-paraphraser"
paraphraser_tokenizer = AutoTokenizer.from_pretrained(paraphraser_name, use_fast=False)
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


User = get_user_model()

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    if request.method == "PATCH":
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.email = request.data.get("email", user.email)
        user.university = request.data.get("university", user.university)  # ✅ добавлено

        #обработка avatar
        if "avatar" in request.FILES:
            user.avatar = request.FILES["avatar"]

        user.save()
        return Response({"message": "Профиль обновлён"})

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "avatar": user.avatar.url if user.avatar else None,
        "university": user.university,  # ✅ добавлено
        "date_joined": user.date_joined,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')  # <-- добавляем

    if not username or not password or not email:
        return Response({'error': 'Заполните все поля'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Пользователь с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Пользователь с таким email уже существует'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': 'Пользователь успешно зарегистрирован'}, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        title = request.data.get("title", "").strip() or "Без названия"
        lecture = Lecture.objects.create(
            user=request.user,
            title=title,
            content=text,
            summary=bullet_summary
)
        return Response(LectureSerializer(lecture).data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    text = request.data.get("text", "")
    count = int(request.data.get("count", 3))
    lecture_id = request.data.get("lecture_id")

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
                q = Question.objects.create(lecture_id=lecture_id, question_text=decoded)
                questions.append(QuestionSerializer(q).data)

        return Response(questions, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_quiz(request):
    count = int(request.data.get("count", 5))
    lecture_id = request.data.get("lecture_id")

    all_quiz = [
        {
            "question_text": "Что такое Интернет?",
            "options": ["Глобальная система объединённых компьютерных сетей", "Программа для просмотра фильмов", "Локальная сеть для школ", "Операционная система"],
            "correct_index": 0
        },
        {
            "question_text": "Когда появился первый прототип Интернета?",
            "options": ["В 1960-х годах", "В 2005 году", "В 1990-х годах", "В 1850 году"],
            "correct_index": 0
        },
        {
            "question_text": "Какая технология легла в основу архитектуры Интернета?",
            "options": ["TCP/IP", "HTTP", "Wi-Fi", "Bluetooth"],
            "correct_index": 0
        },
        {
            "question_text": "Как Интернет используется в здравоохранении?",
            "options": ["Для телемедицинских консультаций и обмена данными", "Для печати книг", "Для создания антивирусов", "Только для развлечений"],
            "correct_index": 0
        },
        {
            "question_text": "Какие риски связаны с Интернетом?",
            "options": ["Киберпреступность и утечки данных", "Повышение урожайности", "Снижение температуры", "Рост населения"],
            "correct_index": 0
        }
    ]

    selected = all_quiz[:count]
    created = []
    for q in selected:
        quiz = Quiz.objects.create(
            lecture_id=lecture_id,
            question_text=q['question_text'],
            options=q['options'],
            correct_index=q['correct_index']
        )
        created.append(QuizSerializer(quiz).data)

    return Response(created, status=status.HTTP_200_OK)
