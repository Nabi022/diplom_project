from rest_framework import serializers
from .models import Lecture, Question, Quiz, Summary, User


class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = '__all__'


class LectureSerializer(serializers.ModelSerializer):
    summaries = SummarySerializer(source='summary_set', many=True, read_only=True)

    class Meta:
        model = Lecture
        fields = ['id', 'user', 'title', 'content', 'summaries', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'avatar',
            'university',
            'date_joined'
        ]
