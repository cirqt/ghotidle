"""
Load phonetic patterns from phonetic_patterns.txt into PostgreSQL database.
Skips patterns that already exist in the database.
"""
import psycopg2
from psycopg2.extras import execute_batch
import os

# Database connection parameters
# Update these with your actual database credentials
DB_CONFIG = {
    'dbname': 'ghodb',
    'user': 'postgres',
    'password': 'admin',
    'host': 'localhost',
    'port': '5432'
}

def load_phonetic_patterns():
    """Load phonetic patterns from file into database."""
    
    # Path to phonetic patterns file (same directory as this script)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    patterns_file = os.path.join(script_dir, 'phonetic_patterns.txt')
    
    print(f"Reading patterns from: {patterns_file}")
    
    # Read all patterns (format: letters\tsound\treference)
    patterns = []
    with open(patterns_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t')
            if len(parts) == 3:
                letters, sound, reference = parts
                patterns.append((letters.lower(), sound.lower(), reference.lower()))
    
    print(f"Loaded {len(patterns)} patterns from file")
    
    # Connect to database
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("Connected to database successfully")
        
        # Create table if it doesn't exist
        cur.execute('''
            CREATE TABLE IF NOT EXISTS "phoneticPattern" (
                id SERIAL PRIMARY KEY,
                letters VARCHAR(10) NOT NULL,
                sound VARCHAR(10) NOT NULL,
                reference VARCHAR(50) NOT NULL
            );
        ''')
        
        # Create indexes if they don't exist
        cur.execute('''
            CREATE INDEX IF NOT EXISTS idx_phoneticpattern_sound 
            ON "phoneticPattern" (sound);
        ''')
        cur.execute('''
            CREATE INDEX IF NOT EXISTS idx_phoneticpattern_letters 
            ON "phoneticPattern" (letters);
        ''')
        
        conn.commit()
        print("Table and indexes ready")
        
        # Check how many patterns already exist
        cur.execute('SELECT COUNT(*) FROM "phoneticPattern"')
        existing_count = cur.fetchone()[0]
        print(f"Existing patterns in database: {existing_count}")
        
        # Insert patterns (skip duplicates)
        print("Inserting patterns (skipping duplicates)...")
        
        inserted_count = 0
        for letters, sound, reference in patterns:
            # Check if this exact pattern already exists
            cur.execute('''
                SELECT id FROM "phoneticPattern" 
                WHERE letters = %s AND sound = %s AND reference = %s;
            ''', (letters, sound, reference))
            
            if cur.fetchone() is None:
                # Pattern doesn't exist, insert it
                cur.execute('''
                    INSERT INTO "phoneticPattern" (letters, sound, reference)
                    VALUES (%s, %s, %s);
                ''', (letters, sound, reference))
                inserted_count += 1
        
        conn.commit()
        
        # Check final count
        cur.execute('SELECT COUNT(*) FROM "phoneticPattern"')
        final_count = cur.fetchone()[0]
        skipped_count = len(patterns) - inserted_count
        
        print(f"\n✅ Success!")
        print(f"   Total patterns in database: {final_count}")
        print(f"   New patterns added: {inserted_count}")
        print(f"   Duplicates skipped: {skipped_count}")
        
        # Show some examples
        print("\nExample patterns loaded:")
        cur.execute('''
            SELECT letters, sound, reference 
            FROM "phoneticPattern" 
            ORDER BY id 
            LIMIT 5;
        ''')
        for letters, sound, ref in cur.fetchall():
            print(f"  {letters} → {sound} (from '{ref}')")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except FileNotFoundError:
        print(f"\n❌ Error: Could not find {patterns_file}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("=" * 60)
    print("Ghotidle - Load Phonetic Patterns to Database")
    print("=" * 60)
    print()
    
    success = load_phonetic_patterns()
    
    if success:
        print("\n✅ Pattern loading completed successfully!")
    else:
        print("\n❌ Pattern loading failed. Please check the errors above.")
