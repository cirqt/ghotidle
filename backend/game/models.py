from django.db import models
from django.contrib.auth.models import User

class ValidWord(models.Model):
    word = models.CharField(max_length=50, primary_key=True)
    
    class Meta:
        db_table = 'validWord'  # Match PostgreSQL table name
        verbose_name = 'Valid Word'
        verbose_name_plural = 'Valid Words'
    
    def __str__(self):
        return self.word


class PhoneticPattern(models.Model):
    """Phonetic patterns: letter combinations and their sounds"""
    letters = models.CharField(max_length=10)  # e.g., "gh", "o", "ti"
    sound = models.CharField(max_length=10)    # e.g., "f", "i", "sh"
    reference = models.CharField(max_length=50)  # e.g., "enough", "women", "nation"
    
    class Meta:
        db_table = 'phoneticPattern'
        verbose_name = 'Phonetic Pattern'
        verbose_name_plural = 'Phonetic Patterns'
        indexes = [
            models.Index(fields=['sound']),
            models.Index(fields=['letters']),
        ]
    
    def __str__(self):
        return f"{self.letters} → {self.sound} (from '{self.reference}')"


class Word(models.Model):
    """Daily puzzle words"""
    secret = models.CharField(max_length=50)  # e.g., "fish"
    phonetic = models.CharField(max_length=50)  # e.g., "ghoti"
    date = models.DateField(unique=True)
    phonetic_patterns = models.ManyToManyField(
        PhoneticPattern, 
        through='PhoneticComponent',
        related_name='words'
    )
    
    class Meta:
        db_table = 'word'
        verbose_name = 'Puzzle Word'
        verbose_name_plural = 'Puzzle Words'
        ordering = ['-date']  # Most recent first
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.date}: {self.phonetic} → {self.secret}"


class PhoneticComponent(models.Model):
    """Junction table linking words to their phonetic patterns"""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, db_column='wordId')
    pattern = models.ForeignKey(PhoneticPattern, on_delete=models.RESTRICT, db_column='patternId')
    
    class Meta:
        db_table = 'phoneticComponent'
        verbose_name = 'Phonetic Component'
        verbose_name_plural = 'Phonetic Components'
        unique_together = [['word', 'pattern']]
    
    def __str__(self):
        return f"{self.word.phonetic} uses {self.pattern.letters}"


class UserStats(models.Model):
    """User statistics for leaderboard"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='userId', primary_key=True)
    correctGuesses = models.IntegerField(default=0, db_column='correctGuesses')
    wrongGuesses = models.IntegerField(default=0, db_column='wrongGuesses')
    streak = models.IntegerField(default=0, db_column='streak')
    
    class Meta:
        db_table = 'userStats'  # camelCase to match your convention
        verbose_name = 'User Statistics'
        verbose_name_plural = 'User Statistics'
    
    def __str__(self):
        return f"{self.user.username}: {self.correctGuesses} correct, streak {self.streak}"
    
    @property
    def total_games(self):
        """Total games played"""
        return self.correctGuesses + self.wrongGuesses
    
    @property
    def win_rate(self):
        """Win rate as percentage"""
        if self.total_games == 0:
            return 0
        return (self.correctGuesses / self.total_games) * 100
