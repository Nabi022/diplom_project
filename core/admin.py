from django.contrib import admin
from .models import User, Lecture, Question, Quiz

admin.site.register(User)
admin.site.register(Lecture)
admin.site.register(Question)
admin.site.register(Quiz)
