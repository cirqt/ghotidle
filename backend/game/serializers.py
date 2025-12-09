from rest_framework import serializers
from .models import Word, PhoneticPattern


class PhoneticPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneticPattern
        fields = ['id', 'pattern', 'explanation']


class WordSerializer(serializers.ModelSerializer):
    patterns = PhoneticPatternSerializer(many=True, read_only=True)
    
    class Meta:
        model = Word
        fields = ['id', 'word', 'difficulty', 'patterns']
