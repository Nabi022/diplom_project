from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    upload_pdf_extract_text,
    summarize_lecture_gpt,
    generate_questions_gpt,
    generate_quiz_gpt,
    user_profile,
    register_user,
    save_lecture,
    user_lectures,       
    get_lecture,
    delete_lecture,         
)

urlpatterns = [
    path("register/", register_user, name="register"),
    path("profile/", user_profile, name="profile"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("save_lecture/", save_lecture, name="save_lecture"),
    path("summarize-gpt/", summarize_lecture_gpt, name="summarize_gpt"),
    path("generate-questions-gpt/", generate_questions_gpt, name="generate_questions_gpt"),
    path("generate-quiz-gpt/", generate_quiz_gpt, name="generate_quiz_gpt"),
    path("upload_pdf/", upload_pdf_extract_text),
    path("user_lectures/", user_lectures, name="user_lectures"),       
    path("lecture/<int:pk>/", get_lecture, name="get_lecture"),         
    path('delete_lecture/<int:pk>/', delete_lecture),
]
