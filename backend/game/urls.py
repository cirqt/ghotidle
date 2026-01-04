from django.urls import path
from . import views

urlpatterns = [
    path('word/', views.get_word, name='get_word'),
    path('validate/', views.validate_guess, name='validate_guess'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_current_user, name='current_user'),
    path('words/', views.create_word, name='create_word'),
    path('phonetic-patterns/', views.create_phonetic_pattern, name='create_pattern'),
    path('phonetic-patterns/suggest/', views.suggest_phonetic_patterns, name='suggest_patterns'),
]
