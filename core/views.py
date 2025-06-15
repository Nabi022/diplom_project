from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import torch
import random
import re
import os
from openai import OpenAI
from dotenv import load_dotenv

from .models import Lecture, Summary
from .serializers import LectureSerializer, QuestionSerializer, QuizSerializer, UserSerializer
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt

load_dotenv()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
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

# GPT-клиент
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_gpt(prompt, max_tokens=1500):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"GPT ошибка: {str(e)}")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def summarize_lecture_gpt(request):
    text = request.data.get("text", "")
    title = request.data.get("title", "Без названия")
    level = request.data.get("level", "medium")  # short, medium, long
    format_type = request.data.get("format", "paragraph")  # "thesis" или "paragraph"

    if not text.strip():
        return Response({"error": "Текст не предоставлен"}, status=400)

    level_prompts = {
        "short": "очень краткий, сжато выдели только главное",
        "medium": "краткий, но с сохранением основной структуры",
        "long": "подробный, максимально раскрывающий содержание",
    }

    if format_type == "thesis":
        prompt = (
            f"Сделай {level_prompts.get(level, 'краткий')} конспект текста лекции в виде списка тезисов. "
            f"Каждый пункт начинай с маркера (•), но **не ставь точку в конце строки**. "
            f"Излагай кратко, избегай воды и общих слов. Вот текст:\n{text}"
        )
    else:
        prompt = (
            f"Сделай {level_prompts.get(level, 'краткий')} конспект текста лекции в виде одного или нескольких абзацев. "
            f"Фокусируйся на сути, избегай воды и общих фраз. Вот текст:\n{text}"
        )

    try:
        summary = ask_gpt(prompt, max_tokens=1500)
        return Response({
            "lecture": {"title": title, "content": text},
            "summary_text": summary
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_questions_gpt(request):
    text = request.data.get("text", "")
    count = int(request.data.get("count", 3))
    if not text.strip():
        return Response({"error": "Текст не предоставлен"}, status=400)

    prompt = (
        f"Сгенерируй {count} контрольных вопросов по следующему тексту. "
        f"Формат: только список вопросов без ответов.\n\n{text}"
    )
    try:
        questions = ask_gpt(prompt)
        question_list = [
            q.strip("-•0123456789. ") for q in questions.split("\n")
            if q.strip() and len(q.strip()) > 5
        ]
        return Response([{"question_text": q} for q in question_list], status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_quiz_gpt(request):
    text = request.data.get("text", "")
    count = int(request.data.get("count", 3))
    if not text.strip():
        return Response({"error": "Текст не предоставлен"}, status=400)

    prompt = (
        f"Сгенерируй {count} тестовых вопросов по следующему тексту. "
        f"У каждого вопроса должно быть 4 варианта ответа, правильный оберни в двойные звёздочки **. "
        f"Формат:\n"
        f"1. Вопрос?\nA) неверно\nB) **правильно**\nC) неверно\nD) неверно\n\n"
        f"Текст:\n{text}"
    )
    try:
        raw_output = ask_gpt(prompt)
        quiz = []
        blocks = re.split(r"\n{2,}", raw_output)

        for block in blocks:
            lines = block.strip().split("\n")
            if len(lines) < 5:
                continue
            question_line = lines[0].strip()
            option_lines = lines[1:5]
            options = []
            correct_index = 0
            for i, line in enumerate(option_lines):
                match = re.match(r"[A-D]\)\s*(.*)", line)
                option_raw = match.group(1).strip() if match else line.strip()
                if "**" in option_raw and correct_index == 0:
                    correct_index = i
                option = re.sub(r"\*\*(.*?)\*\*", r"\1", option_raw).strip()
                options.append(option)
            quiz.append({
                "question_text": question_line,
                "options": options,
                "correct_index": correct_index
            })
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

        lecture = Lecture.objects.create(user=request.user, title=title, content=text)
        Summary.objects.create(lecture=lecture, summary_text=summary_text, format=format)

        return Response({"message": "Лекция успешно сохранена"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
