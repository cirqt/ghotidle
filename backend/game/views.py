from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
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


@api_view(['POST'])
@csrf_exempt
def register_user(request):
    """Register a new user"""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    email = request.data.get('email', '')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(username=username, password=password, email=email)
    login(request, user)
    
    return Response({
        'username': user.username,
        'email': user.email,
        'is_superuser': user.is_superuser
    })


@api_view(['POST'])
@csrf_exempt
def login_user(request):
    """Login user"""
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=401)


@api_view(['POST'])
@csrf_exempt
def logout_user(request):
    """Logout user"""
    if request.user.is_authenticated:
        logout(request)
        # Explicitly flush the session
        request.session.flush()
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
def get_current_user(request):
    """Get currently logged in user"""
    if request.user.is_authenticated:
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'is_superuser': request.user.is_superuser
        })
    else:
        return Response({'error': 'Not authenticated'}, status=401)


@api_view(['POST'])
@csrf_exempt
def suggest_phonetic_patterns(request):
    """Suggest phonetic patterns based on sound breakdown"""
    from .models import PhoneticPattern
    
    # Check if user is authenticated and is superuser
    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response({'error': 'Permission denied. Admin access required.'}, status=403)
    
    sounds = request.data.get('sounds', '').lower().strip()
    
    if not sounds:
        return Response({'suggestions': []})
    
    # Split sounds by hyphen (e.g., "f-i-sh" -> ["f", "i", "sh"])
    sound_list = [s.strip() for s in sounds.split('-') if s.strip()]
    
    suggestions = []
    for sound in sound_list:
        # Find all patterns that produce this sound
        patterns = PhoneticPattern.objects.filter(sound=sound)
        
        pattern_data = []
        for pattern in patterns:
            pattern_data.append({
                'id': pattern.id,
                'letters': pattern.letters,
                'sound': pattern.sound,
                'reference': pattern.reference
            })
        
        suggestions.append({
            'sound': sound,
            'patterns': pattern_data
        })
    
    return Response({'suggestions': suggestions})


@api_view(['POST'])
@csrf_exempt
def create_phonetic_pattern(request):
    """Create a new phonetic pattern - admin only"""
    from .models import PhoneticPattern
    
    # Check if user is authenticated and is superuser
    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response({'error': 'Permission denied. Admin access required.'}, status=403)
    
    letters = request.data.get('letters', '').lower().strip()
    sound = request.data.get('sound', '').lower().strip()
    reference = request.data.get('reference', '').lower().strip()
    
    # Validation
    if not letters or not sound or not reference:
        return Response({'error': 'All fields are required'}, status=400)
    
    if len(letters) > 10 or len(sound) > 10:
        return Response({'error': 'Letters and sound must be 10 characters or less'}, status=400)
    
    if len(reference) > 50:
        return Response({'error': 'Reference word must be 50 characters or less'}, status=400)
    
    # Check if this exact pattern already exists
    if PhoneticPattern.objects.filter(letters=letters, sound=sound, reference=reference).exists():
        return Response({'error': f'This pattern already exists'}, status=400)
    
    try:
        # Create the pattern
        pattern = PhoneticPattern.objects.create(
            letters=letters,
            sound=sound,
            reference=reference
        )
        
        return Response({
            'message': 'Pattern created successfully',
            'pattern': {
                'id': pattern.id,
                'letters': pattern.letters,
                'sound': pattern.sound,
                'reference': pattern.reference
            }
        }, status=201)
    
    except Exception as e:
        return Response({
            'error': f'Failed to create pattern: {str(e)}'
        }, status=500)


@api_view(['POST'])
@csrf_exempt
def create_word(request):
    """Create a new puzzle word - admin only"""
    from .models import Word, PhoneticComponent
    from datetime import date
    
    # Check if user is authenticated and is superuser
    if not request.user.is_authenticated or not request.user.is_superuser:
        return Response({'error': 'Permission denied. Admin access required.'}, status=403)
    
    secret = request.data.get('secret', '').lower().strip()
    phonetic = request.data.get('phonetic', '').lower().strip()
    sounds = request.data.get('sounds', '').lower().strip()
    pattern_ids = request.data.get('pattern_ids', [])
    
    # Validation
    if not secret or not phonetic:
        return Response({'error': 'Both secret and phonetic spelling are required'}, status=400)
    
    if len(secret) > 50 or len(phonetic) > 50:
        return Response({'error': 'Words must be 50 characters or less'}, status=400)
    
    # Check if secret is a valid word
    if not ValidWord.objects.filter(word=secret).exists():
        return Response({
            'error': f'"{secret}" is not a valid word in our dictionary'
        }, status=400)
    
    # Check if word already exists
    if Word.objects.filter(secret=secret).exists():
        return Response({'error': f'Word "{secret}" already exists'}, status=400)
    
    try:
        # Create the word with today's date (for now)
        word = Word.objects.create(
            secret=secret,
            phonetic=phonetic,
            date=date.today()
        )
        
        # Associate selected phonetic patterns with the word
        if pattern_ids:
            for pattern_id in pattern_ids:
                PhoneticComponent.objects.create(
                    wordId=word,
                    patternId_id=pattern_id
                )
        
        return Response({
            'message': 'Word created successfully',
            'word': {
                'secret': word.secret,
                'phonetic': word.phonetic,
                'date': word.date.isoformat(),
                'sounds': sounds,
                'pattern_count': len(pattern_ids)
            }
        }, status=201)
    
    except Exception as e:
        return Response({
            'error': f'Failed to create word: {str(e)}'
        }, status=500)
