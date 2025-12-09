from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Word, PhoneticPattern
from .serializers import WordSerializer


@api_view(['GET'])
def get_random_word(request):
    """Get a random word for the game."""
    word = Word.objects.order_by('?').first()
    if not word:
        return Response(
            {'error': 'No words available. Please add words to the database.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = WordSerializer(word)
    return Response(serializer.data)


@api_view(['POST'])
def validate_guess(request):
    """Validate a player's guess."""
    guess = request.data.get('guess', '').lower().strip()
    target_word_id = request.data.get('word_id')
    
    if not guess:
        return Response(
            {'error': 'Guess is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not target_word_id:
        return Response(
            {'error': 'Word ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        word = Word.objects.get(id=target_word_id)
    except Word.DoesNotExist:
        return Response(
            {'error': 'Word not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if the guess matches the actual word
    is_correct = guess == word.word.lower()
    
    # Check if the guess matches any phonetic patterns
    is_valid_pattern = PhoneticPattern.objects.filter(
        word=word,
        pattern__iexact=guess
    ).exists()
    
    # Generate feedback for each letter
    feedback = []
    target = word.word.lower()
    
    if len(guess) == len(target):
        for i, char in enumerate(guess):
            if char == target[i]:
                feedback.append('correct')  # Green
            elif char in target:
                feedback.append('present')  # Yellow
            else:
                feedback.append('absent')  # Gray
    else:
        feedback = ['absent'] * len(guess)
    
    return Response({
        'is_correct': is_correct,
        'is_valid_pattern': is_valid_pattern,
        'feedback': feedback,
        'message': 'Correct!' if is_correct else 'Try again'
    })


@api_view(['GET'])
def get_word_by_id(request, word_id):
    """Get a specific word by ID."""
    try:
        word = Word.objects.get(id=word_id)
        serializer = WordSerializer(word)
        return Response(serializer.data)
    except Word.DoesNotExist:
        return Response(
            {'error': 'Word not found'},
            status=status.HTTP_404_NOT_FOUND
        )

