from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User  

class APIFunctionalTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        response = self.client.post(reverse('token_obtain_pair'), {
            "username": "testuser", 
            "password": "testpass"
        })
        self.token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_summarize_lecture(self):
        url = reverse("summarize_gpt")
        data = {"text": "Интернет — это глобальная сеть...", "title": "Интернет"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_questions(self):
        url = reverse("generate_questions_gpt")
        data = {"text": "Интернет — это глобальная сеть..."}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_generate_quiz(self):
        url = reverse("generate_quiz_gpt")
        data = {"text": "Интернет — это глобальная сеть...", "count": 3}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
