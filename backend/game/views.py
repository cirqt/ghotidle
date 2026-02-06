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
def request_password_reset(request):
    """Request password reset - sends email with reset token"""
    from django.contrib.auth.tokens import default_token_generator
    from django.core.mail import send_mail
    from django.conf import settings
    
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        
        # In production, send this as a link to frontend
        reset_link = f"http://localhost:3000/reset-password?token={token}&uid={user.pk}"
        
        # Send email
        send_mail(
            subject='Ghotidle - Password Reset Request',
            message=f'Click the link to reset your password:\n\n{reset_link}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.',
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@ghotidle.com',
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'found': True, 'message': 'Password reset email sent successfully.'})
    except User.DoesNotExist:
        return Response({'found': False, 'message': 'No account found with that email address.'})


@api_view(['POST'])
@csrf_exempt
def reset_password(request):
    """Reset password using token"""
    from django.contrib.auth.tokens import default_token_generator
    
    token = request.data.get('token', '')
    uid = request.data.get('uid', '')
    new_password = request.data.get('new_password', '')
    
    if not token or not uid or not new_password:
        return Response({'error': 'Token, user ID, and new password are required'}, status=400)
    
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    
    try:
        user = User.objects.get(pk=uid)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset link'}, status=400)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password reset successfully. You can now log in with your new password.'})
    
    except User.DoesNotExist:
        return Response({'error': 'Invalid reset link'}, status=400)


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
    from .models import Word, PhoneticComponent, PhoneticPattern
    from datetime import date, timedelta
    
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
        # FIFO: Assign next available date after the latest word
        latest_word = Word.objects.order_by('-date').first()
        if latest_word:
            next_date = latest_word.date + timedelta(days=1)
        else:
            # No words yet, start with today
            next_date = date.today()
        
        # Create the word with auto-assigned date
        word = Word.objects.create(
            secret=secret,
            phonetic=phonetic,
            date=next_date
        )
        
        # Parse sounds to get position mapping
        sound_list = [s.strip() for s in sounds.split('-') if s.strip()] if sounds else []
        
        # Associate selected phonetic patterns with the word, preserving position
        # Frontend sends pattern_ids in order matching sound positions
        if pattern_ids and sound_list:
            position = 0
            for sound_index, sound in enumerate(sound_list):
                # Check if this sound position should keep original spelling
                # (Frontend will handle this by not including pattern_id for keep-as-is sounds)
                if sound_index < len(pattern_ids) and pattern_ids[sound_index]:
                    pattern_id = pattern_ids[sound_index]
                    PhoneticComponent.objects.create(
                        word=word,
                        pattern_id=pattern_id,
                        position=position,
                        no_change=False
                    )
                    position += 1
        
        return Response({
            'message': 'Word created successfully',
            'word': {
                'secret': word.secret,
                'phonetic': word.phonetic,
                'date': word.date.isoformat(),
                'sounds': sounds,
                'pattern_count': len(pattern_ids) if pattern_ids else 0
            }
        }, status=201)
    
    except Exception as e:
        return Response({
            'error': f'Failed to create word: {str(e)}'
        }, status=500)


@api_view(['GET'])
def get_random_word(request):
    """
    Get a random valid word from the database
    """
    try:
        word = ValidWord.objects.order_by('?').first()
        if word:
            return Response({
                'word': word.word
            })
        return Response({
            'error': 'No words found in database'
        }, status=404)
    except Exception as e:
        return Response({
            'error': f'Failed to get random word: {str(e)}'
        }, status=500)
