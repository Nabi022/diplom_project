from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, T5ForConditionalGeneration, pipeline
import torch
import random
import re
from .models import Lecture
from .serializers import LectureSerializer, QuestionSerializer, QuizSerializer, UserSerializer
from django.contrib.auth import get_user_model
from .models import Summary
from django.views.decorators.csrf import csrf_exempt
import traceback

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Модели
paraphraser_name = "cointegrated/rut5-base-paraphraser"
paraphraser_tokenizer = AutoTokenizer.from_pretrained(paraphraser_name, use_fast=False)
paraphraser_model = AutoModelForSeq2SeqLM.from_pretrained(paraphraser_name).to(device)

sum_model_name = "cointegrated/rut5-base-absum"
sum_tokenizer = AutoTokenizer.from_pretrained(sum_model_name)
sum_model = AutoModelForSeq2SeqLM.from_pretrained(sum_model_name).to(device)

# Для генерации вопросов
questions_model_name = "hivaze/AAQG-QA-QG-FRED-T5-1.7B"
qg_tokenizer = AutoTokenizer.from_pretrained(questions_model_name)
qg_model = T5ForConditionalGeneration.from_pretrained(questions_model_name).to(device)

# Для генерации тестов
question_tokenizer = AutoTokenizer.from_pretrained("hivaze/AAQG-QA-QG-FRED-T5-1.7B")
question_model = T5ForConditionalGeneration.from_pretrained("hivaze/AAQG-QA-QG-FRED-T5-1.7B").to(device)

# Ответы к вопросам
qa_pipeline = pipeline(
    "question-answering",
    model="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru",
    tokenizer="AlexKay/xlm-roberta-large-qa-multilingual-finedtuned-ru",
    device=0 if torch.cuda.is_available() else -1
)

User = get_user_model()

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == "PATCH":
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.email = request.data.get("email", user.email)
        user.university = request.data.get("university", user.university)
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
        "university": user.university,
        "date_joined": user.date_joined,
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
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
    input_ids = paraphraser_tokenizer.encode(prompt, return_tensors="pt", max_length=256, truncation=True).to(device)
    output_ids = paraphraser_model.generate(input_ids, max_length=256, num_beams=5,
                                            no_repeat_ngram_size=3, repetition_penalty=1.5,
                                            temperature=0.9, early_stopping=True)
    result = paraphraser_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return re.sub(r'^(Комментарий|Параграф|Описание|Пример|Например|Следовательно|В целом)[:,]?\s+', '', result, flags=re.IGNORECASE)

def summarize_long_text_by_parts(full_text, tokenizer, model, device, level="medium"):
    max_len, min_len = {"short": (180, 40), "long": (350, 120)}.get(level, (250, 80))
    paragraphs = [p.strip() for p in full_text.split('\n') if p.strip()]
    bullet_points = []

    for paragraph in paragraphs:
        prompt = f"summarize: {paragraph}"
        input_ids = tokenizer.encode(prompt, return_tensors="pt", max_length=1024, truncation=True).to(device)
        output_ids = model.generate(input_ids=input_ids, max_length=max_len, min_length=min_len,
                                    num_beams=5, no_repeat_ngram_size=3, early_stopping=True)
        summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        for s in re.split(r'(?<=[.!?])\s+', summary.strip()):
            if not s.strip(): continue
            try: paraphrased = paraphrase(s.strip())
            except: paraphrased = s.strip()
            bullet = f"• {paraphrased[0].upper() + paraphrased[1:]}" if paraphrased and paraphrased[0].islower() else f"• {paraphrased}"
            bullet_points.append(bullet)

    return "\n".join(bullet_points)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def summarize_lecture(request):
    text = request.data.get("text", "")
    level = request.data.get("level", "medium")
    title = request.data.get("title", "").strip() or "Без названия"

    if not text.strip():
        return Response({"error": "Текст не предоставлен"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        summary = summarize_long_text_by_parts(text, sum_tokenizer, sum_model, device, level)
        return Response({
            "lecture": {
                "title": title,
                "content": text
            },
            "summary_text": summary
        }, status=status.HTTP_200_OK)
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
        output_ids = qg_model.generate(input_ids=input_ids, max_length=128, num_beams=5,
                                       num_return_sequences=count, early_stopping=True,
                                       no_repeat_ngram_size=2)

        questions = [qg_tokenizer.decode(out, skip_special_tokens=True).strip()
                     for out in output_ids if qg_tokenizer.decode(out, skip_special_tokens=True).strip()]

        return Response([{"question_text": q} for q in questions], status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_quiz(request):
    try:
        text = request.data.get("text", "")
        count = int(request.data.get("count", 3))

        if not text.strip():
            return Response({"error": "Текст не предоставлен"}, status=400)

        # 1. Генерация вопросов
        input_text = f"generate questions: {text[:3000]}"
        input_ids = question_tokenizer.encode(input_text, return_tensors="pt", max_length=1024, truncation=True).to(device)

        output_ids = question_model.generate(
            input_ids=input_ids,
            max_length=128,
            num_beams=5,
            num_return_sequences=count,
            early_stopping=True
        )

        questions = [
            question_tokenizer.decode(out, skip_special_tokens=True).strip()
            for out in output_ids
        ]

        quiz = []

        for q in questions:
            try:
                # 2. Получение ответа к вопросу
                answer_result = qa_pipeline(question=q, context=text)
                correct = answer_result['answer'].strip()

                if not correct or len(correct) < 2:
                    continue

                # 3. Заглушки — фейковые варианты
                fake_pool = [
                    "Операционная система", "Локальная сеть", "Bluetooth", "Флешка",
                    "Видеокарта", "Приложение", "Клавиатура", "Сканер"
                ]
                distractors = random.sample([a for a in fake_pool if a.lower() != correct.lower()], 3)

                options = [correct] + distractors
                random.shuffle(options)
                correct_index = options.index(correct)

                quiz.append({
                    "question_text": q,
                    "options": options,
                    "correct_index": correct_index
                })

            except Exception as e:
                print(f"Ошибка генерации ответа: {e}")
                continue

        return Response(quiz, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_lecture(request):
    try:
        title = request.data.get("title", "Без названия")
        text = request.data.get("text", "")
        summary_text = request.data.get("summary", "")
        format = request.data.get("format", "тезисы")

        if not text or not summary_text:
            return Response({"error": "Данные неполные"}, status=400)

        lecture = Lecture.objects.create(
            user=request.user,
            title=title,
            content=text
        )

        Summary.objects.create(
            lecture=lecture,
            summary_text=summary_text,
            format=format
        )

        return Response({"message": "Лекция успешно сохранена"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

