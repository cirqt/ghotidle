from django.contrib import admin
from .models import ValidWord, Word, PhoneticPattern, PhoneticComponent

@admin.register(ValidWord)
class ValidWordAdmin(admin.ModelAdmin):
    list_display = ['word']
    search_fields = ['word']
    list_per_page = 50
    ordering = ['word']

@admin.register(PhoneticPattern)
class PhoneticPatternAdmin(admin.ModelAdmin):
    list_display = ['letters', 'sound', 'reference']
    search_fields = ['letters', 'sound', 'reference']
    list_filter = ['sound']

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['date', 'phonetic', 'secret']
    search_fields = ['secret', 'phonetic']
    list_filter = ['date']
    date_hierarchy = 'date'
    ordering = ['-date']

# Note: PhoneticComponent is the through table for ManyToMany relationship
# It's automatically managed through the Word admin interface


# class PhoneticPatternInline(admin.TabularInline):
#     model = PhoneticPattern
#     extra = 1


# @admin.register(Word)
# class WordAdmin(admin.ModelAdmin):
#     list_display = ['word', 'difficulty', 'created_at']
#     list_filter = ['difficulty', 'created_at']
#     search_fields = ['word']
#     inlines = [PhoneticPatternInline]


# @admin.register(PhoneticPattern)
# class PhoneticPatternAdmin(admin.ModelAdmin):
#     list_display = ['pattern', 'word', 'explanation']
#     list_filter = ['word']
#     search_fields = ['pattern', 'word__word']

