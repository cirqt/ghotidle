from django.urls import path
from . import views

urlpatterns = [
    path('word/random/', views.get_random_word, name='random_word'),
    path('word/<int:word_id>/', views.get_word_by_id, name='get_word'),
    path('validate/', views.validate_guess, name='validate_guess'),
]
