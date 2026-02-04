# Ghotidle Data Loading Scripts

Scripts for loading data into the PostgreSQL database across multiple workstations.

## Scripts

### 1. `load_valid_words.py`
Loads 97,054 valid English words (1-7 characters) from `words_filtered.txt` into the `validWord` table.

**Usage:**
```powershell
cd backend
python data/load_valid_words.py
```

**What it does:**
- Creates `validWord` table if it doesn't exist
- Inserts all words from `words_filtered.txt`
- Skips words that already exist (safe to run multiple times)
- Creates index for fast lookups

---

### 2. `load_phonetic_patterns.py` ⭐ NEW
Loads curated phonetic patterns into the `phoneticPattern` table.

**Usage:**
```powershell
cd backend
python data/load_phonetic_patterns.py
```

**What it does:**
- Loads 28 phonetic patterns (one clear example per sound)
- Each pattern includes: letters, sound, and reference word
- Skips patterns that already exist (safe to run multiple times)
- Creates indexes for performance

**Examples loaded:**
- `gh → f` (from "enough")
- `o → i` (from "women")
- `ti → sh` (from "nation")
- `ph → f` (from "phone")
- `ch → k` (from "chorus")
- And 23 more patterns...

---

## Initial Setup (New Workstation)

After cloning the repo and setting up PostgreSQL:

```powershell
# 1. Run Django migrations (creates tables)
cd backend
python manage.py migrate

# 2. Load valid words dictionary
python data/load_valid_words.py

# 3. Load phonetic patterns
python data/load_phonetic_patterns.py

# 4. (Optional) Create admin user
python manage.py createsuperuser
```

---

## Database Configuration

Both scripts use these default PostgreSQL connection settings:

```python
DB_CONFIG = {
    'dbname': 'ghodb',
    'user': 'postgres',
    'password': 'admin',  # Update if different
    'host': 'localhost',
    'port': '5432'
}
```

**⚠️ Important:** Update the `password` field in each script if your PostgreSQL password is different.

---

## Word Files

- **`words_filtered.txt`** (97,054 words) - Filtered to 1-7 character words for game validation
- **`words.txt`** (466,551 words) - Original unfiltered word list
- **`filter_words.py`** - Script used to create filtered list

---

## Notes

- All scripts are **idempotent** (safe to run multiple times)
- Duplicate entries are automatically skipped
- All reference words in phonetic patterns exist in `words_filtered.txt`
- Scripts display progress and summary statistics
