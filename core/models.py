from django.db import models
from django.contrib.auth.models import User

class Lecture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    content = models.TextField()  # исходный текст
    summary = models.TextField(blank=True)  # сокращённый текст
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"
