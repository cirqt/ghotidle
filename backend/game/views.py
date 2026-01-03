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
        'is_admin': user.username == 'cirqt'
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
            'is_admin': user.username == 'cirqt'
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
            'is_admin': request.user.username == 'cirqt'
        })
    else:
        return Response({'error': 'Not authenticated'}, status=401)
