from django.db import models

class ValidWord(models.Model):
    word = models.CharField(max_length=50, primary_key=True)
    
    class Meta:
        db_table = 'validWord'  # Match PostgreSQL table name

