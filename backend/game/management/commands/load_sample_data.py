from django.core.management.base import BaseCommand
from django.utils import timezone
from game.models import Word, PhoneticPattern, PhoneticComponent


SAMPLE_WORDS = [
    {
        'secret': 'fish',
        'phonetic': 'ghoti',
        'patterns': [
            {'letters': 'gh', 'sound': 'f', 'reference': 'enough'},
            {'letters': 'o', 'sound': 'i', 'reference': 'women'},
            {'letters': 'ti', 'sound': 'sh', 'reference': 'nation'},
        ],
    },
    {
        'secret': 'potato',
        'phonetic': 'photeighteau',
        'patterns': [
            {'letters': 'o', 'sound': 'oh', 'reference': 'go'},
            {'letters': 'te', 'sound': 't', 'reference': 'ballet'},
            {'letters': 'eigh', 'sound': 'ay', 'reference': 'eight'},
            {'letters': 't', 'sound': 't', 'reference': 'top'},
            {'letters': 'eau', 'sound': 'oh', 'reference': 'plateau'},
        ],
    },
    {
        'secret': 'enough',
        'phonetic': 'ynough',
        'patterns': [
            {'letters': 'y', 'sound': 'i', 'reference': 'gym'},
            {'letters': 'ough', 'sound': 'uff', 'reference': 'rough'},
        ],
    },
]


class Command(BaseCommand):
    help = 'Load sample puzzle words into the database'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()

        for i, entry in enumerate(SAMPLE_WORDS):
            word_date = today + timezone.timedelta(days=i - 1)  # yesterday, today, tomorrow

            # Create or get the Word
            word_obj, created = Word.objects.get_or_create(
                secret=entry['secret'],
                defaults={
                    'phonetic': entry['phonetic'],
                    'date': word_date,
                }
            )

            if created:
                self.stdout.write(f"Created word: {entry['secret']} for {word_date}")
            else:
                self.stdout.write(f"Word already exists: {entry['secret']}")
                continue

            # Create patterns and link them
            for idx, pattern_data in enumerate(entry['patterns']):
                pattern, _ = PhoneticPattern.objects.get_or_create(
                    letters=pattern_data['letters'],
                    sound=pattern_data['sound'],
                    defaults={'reference': pattern_data['reference']},
                )
                PhoneticComponent.objects.get_or_create(
                    word=word_obj,
                    position=idx,
                    defaults={'pattern': pattern},
                )

        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
