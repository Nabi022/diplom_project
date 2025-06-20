from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    university = models.CharField(max_length=255, blank=True, null=True)  
    date_joined = models.DateTimeField(auto_now_add=True)

    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return self.username

class Lecture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    content = models.TextField()
    summary = models.TextField(blank=True)
    format = models.CharField(max_length=50, default='текст') 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text

class Quiz(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='quizzes')
    question_text = models.TextField()
    options = models.JSONField()
    correct_index = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text
    
class Summary(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="summary_set") 
    title = models.CharField(max_length=255, default='Без названия')
    summary_text = models.TextField()
    format = models.CharField(max_length=50, default='тезисы')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
