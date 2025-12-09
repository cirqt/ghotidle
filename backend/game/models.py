from django.db import models


class Word(models.Model):
    """A word that can be guessed in the game."""
    word = models.CharField(max_length=100, unique=True)
    difficulty = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.word
    
    class Meta:
        ordering = ['difficulty', 'word']


class PhoneticPattern(models.Model):
    """A phonetic pattern for spelling a word unconventionally."""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='patterns')
    pattern = models.CharField(max_length=100)
    explanation = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.pattern} -> {self.word.word}"
    
    class Meta:
        unique_together = ['word', 'pattern']

