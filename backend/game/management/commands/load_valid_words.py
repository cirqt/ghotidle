import os
from django.core.management.base import BaseCommand
from game.models import ValidWord


class Command(BaseCommand):
    help = 'Load valid words from words_filtered.txt into the database'

    def handle(self, *args, **kwargs):
        # Check if already loaded
        if ValidWord.objects.exists():
            self.stdout.write('Valid words already loaded, skipping.')
            return

        words_file = os.path.join(
            os.path.dirname(__file__),  # commands/
            '..', '..', '..', '..', 'data', 'words_filtered.txt'
        )
        words_file = os.path.abspath(words_file)

        if not os.path.exists(words_file):
            self.stdout.write(self.style.ERROR(f'Words file not found: {words_file}'))
            return

        self.stdout.write(f'Loading words from {words_file}...')

        with open(words_file, 'r', encoding='utf-8') as f:
            words = [line.strip().lower() for line in f if line.strip()]

        self.stdout.write(f'Read {len(words)} words, inserting into database...')

        # Bulk insert in batches of 5000
        batch_size = 5000
        total = 0
        for i in range(0, len(words), batch_size):
            batch = words[i:i + batch_size]
            ValidWord.objects.bulk_create(
                [ValidWord(word=w) for w in batch],
                ignore_conflicts=True
            )
            total += len(batch)
            self.stdout.write(f'  Inserted {total}/{len(words)}...')

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(words)} valid words.'))
