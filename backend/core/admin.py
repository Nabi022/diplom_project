from django.contrib import admin
from .models import Lecture, Summary, Question, Quiz, User

admin.site.register(User)
admin.site.register(Lecture)
admin.site.register(Summary)
admin.site.register(Question)
admin.site.register(Quiz)
