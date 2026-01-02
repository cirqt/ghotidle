from django.urls import path
from . import views

urlpatterns = [
    path('word/', views.get_word, name='get_word'),
    path('validate/', views.validate_guess, name='validate_guess'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_current_user, name='current_user'),
]
