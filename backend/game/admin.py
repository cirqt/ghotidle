from django.contrib import admin
from .models import Word, PhoneticPattern


class PhoneticPatternInline(admin.TabularInline):
    model = PhoneticPattern
    extra = 1


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['word', 'difficulty', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['word']
    inlines = [PhoneticPatternInline]


@admin.register(PhoneticPattern)
class PhoneticPatternAdmin(admin.ModelAdmin):
    list_display = ['pattern', 'word', 'explanation']
    list_filter = ['word']
    search_fields = ['pattern', 'word__word']

