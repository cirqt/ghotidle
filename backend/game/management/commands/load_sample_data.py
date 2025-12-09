from django.core.management.base import BaseCommand
from game.models import Word, PhoneticPattern


class Command(BaseCommand):
    help = 'Load sample words and phonetic patterns for the game'

    def handle(self, *args, **kwargs):
        # Sample words with phonetic patterns
        sample_data = [
            {
                'word': 'fish',
                'difficulty': 1,
                'patterns': [
                    {'pattern': 'ghoti', 'explanation': 'gh as in "enough", o as in "women", ti as in "nation"'},
                ]
            },
            {
                'word': 'cat',
                'difficulty': 1,
                'patterns': [
                    {'pattern': 'ckat', 'explanation': 'Silent k like in "knife"'},
                ]
            },
            {
                'word': 'phone',
                'difficulty': 2,
                'patterns': [
                    {'pattern': 'fone', 'explanation': 'ph sounds like f'},
                ]
            },
            {
                'word': 'knight',
                'difficulty': 2,
                'patterns': [
                    {'pattern': 'nite', 'explanation': 'Silent kn, silent gh'},
                ]
            },
            {
                'word': 'enough',
                'difficulty': 2,
                'patterns': [
                    {'pattern': 'enuf', 'explanation': 'gh sounds like f'},
                ]
            },
        ]

        for item in sample_data:
            word, created = Word.objects.get_or_create(
                word=item['word'],
                defaults={'difficulty': item['difficulty']}
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created word: {word.word}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Word already exists: {word.word}')
                )
            
            for pattern_data in item['patterns']:
                pattern, created = PhoneticPattern.objects.get_or_create(
                    word=word,
                    pattern=pattern_data['pattern'],
                    defaults={'explanation': pattern_data['explanation']}
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'  Added pattern: {pattern.pattern}')
                    )

        self.stdout.write(
            self.style.SUCCESS('\nSample data loaded successfully!')
        )
