from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ValidWord  # Import the ValidWord model


@api_view(['GET'])
def get_word(request):
    """
    Simple GET endpoint: returns the target word with phonetic components
    """
    return Response({
        'word': 'fish',
        'phonetic_spelling': 'gh,o,ti',  # Split by phonetic components
        'length': 4
    })


@api_view(['POST'])
def validate_guess(request):
    """
    Simple validation: compare guess against hardcoded "fish"
    Returns letter-by-letter feedback
    """
    TARGET_WORD = 'fish'
    guess = request.data.get('guess', '').lower()
    
    # Check if word is valid first
    if not ValidWord.objects.filter(word=guess).exists():
        return Response({
            'error': 'Not a valid word',
            'guess': guess
        }, status=400)
    
    # Calculate letter feedback
    feedback = []
    target_letters = list(TARGET_WORD)
    guess_letters = list(guess)
    
    # First pass: mark correct positions (green)
    remaining_target = target_letters.copy()
    for i, char in enumerate(guess_letters):
        if i < len(target_letters) and char == target_letters[i]:
            feedback.append({
                'letter': char,
                'status': 'correct',
                'position': i
            })
            remaining_target[i] = None  # Mark as used
        else:
            feedback.append({
                'letter': char,
                'status': 'absent',
                'position': i
            })
    
    # Second pass: mark present letters (yellow)
    for i, item in enumerate(feedback):
        if item['status'] == 'absent':
            char = item['letter']
            if char in remaining_target:
                feedback[i]['status'] = 'present'
                remaining_target[remaining_target.index(char)] = None  # Mark as used
    
    return Response({
        'guess': guess,
        'feedback': feedback,
        'is_correct': guess == TARGET_WORD,
        'length_match': len(guess) == len(TARGET_WORD)
    })

