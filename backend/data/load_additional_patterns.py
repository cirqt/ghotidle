"""
Load additional phonetic patterns into the database.
This script adds more patterns to expand the game's vocabulary.
Patterns are hardcoded so this can be run on any workstation.
"""
import os
import sys

# Add parent directory to path for Django imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghotidle_backend.settings')
import django
django.setup()

from game.models import PhoneticPattern

def load_additional_patterns():
    """Load additional phonetic patterns directly into database."""
    
    # Hardcoded patterns - no external file needed
    patterns = [
        # Silent letters
        ('bt', 't', 'debt'),
        ('pt', 't', 'receipt'),
        ('cht', 't', 'yacht'),
        ('tch', 'ch', 'watch'),
        ('dge', 'j', 'bridge'),
        ('gu', 'g', 'guitar'),
        ('rh', 'r', 'rhythm'),
        
        # Vowel sounds
        ('ai', 'ay', 'rain'),
        ('ay', 'ay', 'day'),
        ('ei', 'ee', 'ceiling'),
        ('ey', 'ee', 'key'),
        ('y', 'i', 'gym'),
        ('y', 'ee', 'happy'),
        ('ie', 'y', 'pie'),
        ('ui', 'oo', 'fruit'),
        ('au', 'aw', 'autumn'),
        ('aw', 'aw', 'law'),
        
        # Consonant combinations
        ('sh', 'sh', 'shop'),
        ('th', 'th', 'think'),
        ('wh', 'w', 'what'),
        ('qu', 'kw', 'queen'),
        ('x', 'ks', 'box'),
        ('c', 's', 'city'),
        ('c', 'k', 'cat'),
        ('ce', 's', 'nice'),
        ('ci', 'sh', 'special'),
        
        # Complex patterns
        ('tion', 'shun', 'action'),
        ('sion', 'zhun', 'vision'),
        ('cian', 'shun', 'musician'),
        ('ough', 'aw', 'bought'),
        ('augh', 'aw', 'caught'),
        ('eigh', 'a', 'neighbor'),
        ('igh', 'i', 'night'),
        ('aigh', 'ay', 'straight'),
        
        # Double letters with single sound
        ('ff', 'f', 'off'),
        ('ll', 'l', 'ball'),
        ('ss', 's', 'pass'),
        ('tt', 't', 'butter'),
        ('ck', 'k', 'back'),
        ('ng', 'ng', 'sing'),
        ('nk', 'nk', 'think'),
        
        # Tricky sounds
        ('oo', 'uh', 'blood'),
        ('ou', 'u', 'country'),
        ('a', 'o', 'want'),
        ('o', 'u', 'son'),
        ('e', 'i', 'pretty'),
        ('i', 'ee', 'machine'),
        ('u', 'oo', 'put'),
    ]
    
    print(f"Loaded {len(patterns)} patterns from hardcoded list")
    
    # Check how many patterns already exist
    existing_count = PhoneticPattern.objects.exclude(letters='*').count()
    print(f"Existing patterns in database: {existing_count}")
    
    # Insert patterns (skip duplicates)
    print("Inserting patterns (skipping duplicates)...")
    
    inserted_count = 0
    skipped_count = 0
    
    for letters, sound, reference in patterns:
        # Check if this exact pattern already exists
        if PhoneticPattern.objects.filter(letters=letters, sound=sound, reference=reference).exists():
            skipped_count += 1
        else:
            # Pattern doesn't exist, create it
            PhoneticPattern.objects.create(
                letters=letters,
                sound=sound,
                reference=reference
            )
            inserted_count += 1
    
    # Check final count
    final_count = PhoneticPattern.objects.exclude(letters='*').count()
    
    print(f"\n✅ Success!")
    print(f"   Total patterns in database: {final_count}")
    print(f"   New patterns added: {inserted_count}")
    print(f"   Duplicates skipped: {skipped_count}")
    
    # Show some new patterns
    if inserted_count > 0:
        print("\nSample of newly added patterns:")
        new_patterns = PhoneticPattern.objects.exclude(letters='*').order_by('-id')[:5]
        for pattern in new_patterns:
            print(f"  {pattern.letters} → {pattern.sound} (from '{pattern.reference}')")
    
    return True

if __name__ == '__main__':
    print("=" * 60)
    print("Ghotidle - Load Additional Phonetic Patterns")
    print("=" * 60)
    print()
    
    try:
        success = load_additional_patterns()
        if success:
            print("\n✅ Pattern loading completed successfully!")
        else:
            print("\n❌ Pattern loading failed.")
            sys.exit(1)
    except FileNotFoundError as e:
        print(f"\n❌ Error: Could not find patterns file")
        print(f"   {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
