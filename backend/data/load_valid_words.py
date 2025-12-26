"""
Load valid words from words_filtered.txt into PostgreSQL database.
Skips words that already exist in the database.
"""
import psycopg2
from psycopg2.extras import execute_batch
import os

# Database connection parameters
# Update these with your actual database credentials
DB_CONFIG = {
    'dbname': 'ghodb',      # Your database name
    'user': 'postgres',     # Your PostgreSQL username
    'password': 'admin', # Your PostgreSQL password
    'host': 'localhost',
    'port': '5432'
}

def load_words_to_db():
    """Load words from file into database."""
    
    # Path to the filtered word list (same directory as this script)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    words_file = os.path.join(script_dir, 'words_filtered.txt')
    
    print(f"Reading words from: {words_file}")
    
    # Read all words
    with open(words_file, 'r', encoding='utf-8') as f:
        words = [line.strip().lower() for line in f if line.strip()]
    
    print(f"Loaded {len(words)} words from file")
    
    # Connect to database
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("Connected to database successfully")
        
        # Create table if it doesn't exist
        cur.execute('''
            CREATE TABLE IF NOT EXISTS "validWord" (
                word VARCHAR(50) PRIMARY KEY
            );
        ''')
        
        # Create index if it doesn't exist
        cur.execute('''
            CREATE INDEX IF NOT EXISTS idx_validword_word 
            ON "validWord" (word);
        ''')
        
        conn.commit()
        print("Table and index ready")
        
        # Check how many words already exist
        cur.execute('SELECT COUNT(*) FROM "validWord"')
        existing_count = cur.fetchone()[0]
        print(f"Existing words in database: {existing_count}")
        
        # Insert words using ON CONFLICT to skip duplicates
        print("Inserting words (skipping duplicates)...")
        
        # Batch insert for better performance
        insert_query = '''
            INSERT INTO "validWord" (word) 
            VALUES (%s) 
            ON CONFLICT (word) DO NOTHING
        '''
        
        # Convert to list of tuples for execute_batch
        word_tuples = [(word,) for word in words]
        
        # Insert in batches of 1000
        execute_batch(cur, insert_query, word_tuples, page_size=1000)
        
        conn.commit()
        
        # Check final count
        cur.execute('SELECT COUNT(*) FROM "validWord"')
        final_count = cur.fetchone()[0]
        new_words = final_count - existing_count
        
        print(f"\n✅ Success!")
        print(f"   Total words in database: {final_count}")
        print(f"   New words added: {new_words}")
        print(f"   Duplicates skipped: {len(words) - new_words}")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except FileNotFoundError:
        print(f"\n❌ Error: Could not find {words_file}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Ghotidle - Load Valid Words to Database")
    print("=" * 60)
    print()
    
    success = load_words_to_db()
    
    if success:
        print("\n✅ Word loading completed successfully!")
    else:
        print("\n❌ Word loading failed. Please check the errors above.")
