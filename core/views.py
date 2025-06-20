from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import torch
import random
import re
import os
import fitz
from openai import OpenAI
from dotenv import load_dotenv
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .models import Lecture, Summary
from .serializers import LectureSerializer, QuestionSerializer, QuizSerializer, UserSerializer
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from .serializers import UserSerializer

load_dotenv()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def upload_pdf_extract_text(request):
    pdf_file = request.FILES.get("file")
    if not pdf_file:
        return JsonResponse({"error": "Файл не предоставлен"}, status=400)

    try:
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
        return JsonResponse({"text": full_text}, status=200)
    except Exception as e:
        return JsonResponse({"error": f"Ошибка при обработке PDF: {str(e)}"}, status=500)


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

    serializer = UserSerializer(user)
    return Response(serializer.data)

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
            model="gpt-4",  # временно используем GPT-4
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
        "short": "сделай краткий конспект, выдели только самую важную информацию",
        "medium": "сделай сокращение с сохранением структуры, передай ключевые мысли и термины",
        "long": "сделай подробное, но ёмкое изложение с раскрытием сути каждого раздела",
    }

    if format_type == "thesis":
        prompt = (
            f"{level_prompts.get(level, 'сделай краткое сжатие')} следующего текста в виде списка тезисов. "
            f"Каждый пункт начинай с символа (•), не ставь точку в конце. "
            f"Излагай конкретно, без общих слов. Сохрани логику и структуру оригинала, не упускай важные пункты. "
            f"Удели внимание ключевым требованиям, обязанностям, запретам и последовательности. "
            f"Вот текст:\n{text}"
        )
    else:
        prompt = (
            f"{level_prompts.get(level, 'сделай краткое сжатие')} следующего текста. "
            f"Представь результат в виде абзацев. Стиль — деловой, точный, без лишней воды. "
            f"Соблюдай структуру документа, заголовки, логическую последовательность и важные детали. "
            f"Передавай смысл каждого раздела, включая конкретные действия, запреты и обязанности. "
            f"Вот текст:\n{text}"
        )

    try:
        summary = ask_gpt(prompt, max_tokens=2500)
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
        f"Ты — эксперт по обучению. Сформулируй {count} контрольных вопросов по приведённому ниже тексту. "
        f"Вопросы должны быть разнообразными, проверять понимание содержания и ключевых положений текста. "
        f"Не добавляй ответы. Не нумеруй. Просто выведи каждый вопрос с новой строки.\n\n"
        f"Текст:\n{text}"
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
        f"У каждого вопроса должно быть ровно 4 варианта ответа. "
        f"Правильный вариант оберни в двойные звёздочки (пример: **правильный**). "
        f"Формат:\n"
        f"Вопрос?\nA) вариант\nB) **правильный**\nC) вариант\nD) вариант\n\n"
        f"Текст:\n{text}"
    )

    try:
        raw_output = ask_gpt(prompt)
        quiz = []
        blocks = re.split(r"\n{2,}", raw_output.strip())

        for block in blocks:
            lines = block.strip().split("\n")
            if len(lines) < 5:
                continue

            question_line = re.sub(r"^\d+[\.\)]\s*", "", lines[0].strip())  # удаляем ручную нумерацию
            option_lines = lines[1:5]
            options = []
            correct_index = None

            for i, line in enumerate(option_lines):
                match = re.match(r"[A-Da-d]\)\s*(.*)", line)
                option_raw = match.group(1).strip() if match else line.strip()

                if "**" in option_raw and correct_index is None:
                    correct_index = i
                clean_option = re.sub(r"\*\*(.*?)\*\*", r"\1", option_raw)
                options.append(clean_option)

            if correct_index is None:
                correct_index = 0  # fallback — если модель не выделила

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

        lecture = Lecture.objects.create(
            user=request.user,
            title=title,
            content=text,
            summary=summary_text,
            format=format
        )

        return Response({"message": "Лекция успешно сохранена"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_lectures(request):
    lectures = Lecture.objects.filter(user=request.user).order_by("-created_at")
    data = [
        {
            "id": lec.id,
            "title": lec.title,
            "format": lec.format,
            "created_at": lec.created_at.strftime("%Y-%m-%d")
        }
        for lec in lectures
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_lecture(request, pk):
    lecture = Lecture.objects.filter(id=pk, user=request.user).first()
    if not lecture:
        return Response({"error": "Лекция не найдена"}, status=404)

    return Response({
        "id": lecture.id,
        "title": lecture.title,
        "text": lecture.content,
        "summary": lecture.summary,
        "format": lecture.format,
        "created_at": lecture.created_at.strftime("%Y-%m-%d")
    })

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_lecture(request, pk):
    try:
        lecture = Lecture.objects.get(id=pk, user=request.user)
        lecture.delete()
        return Response({"detail": "Удалено"}, status=204)
    except Lecture.DoesNotExist:
        return Response({"error": "Лекция не найдена"}, status=404)
