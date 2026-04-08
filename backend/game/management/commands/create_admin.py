import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create admin superuser from environment variables if it does not exist'

    def handle(self, *args, **kwargs):
        username = os.environ.get('DJANGO_ADMIN_USER', 'admin')
        email = os.environ.get('DJANGO_ADMIN_EMAIL', '')
        password = os.environ.get('DJANGO_ADMIN_PASSWORD', '')

        if not password:
            self.stdout.write('DJANGO_ADMIN_PASSWORD not set, skipping admin creation.')
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f'Admin user "{username}" already exists, skipping.')
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
