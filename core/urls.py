from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import (
    summarize_lecture,
    generate_questions,
    generate_quiz,
    user_profile,
    register_user,
    save_lecture,  # <--- здесь импорт
)

urlpatterns = [
    path('register/', register_user, name='register'), 
    path('summarize/', summarize_lecture, name='summarize'),
    path('questions/', generate_questions, name='questions'),
    path('quiz/', generate_quiz, name='quiz'),
    path('profile/', user_profile, name='profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("save_lecture/", save_lecture, name="save_lecture"),  # без 'api/'
]
