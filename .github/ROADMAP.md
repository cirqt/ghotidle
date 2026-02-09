# Ghotidle Development Roadmap (February 2026)

## ✅ Completed Features
- User authentication (register, login, logout, password reset)
- Admin panel for creating words and patterns
- 34+ phonetic patterns loaded
- Pattern suggestion engine (type sounds → see matching patterns)
- "Keep as-is" checkbox for sounds without replacement
- Valid word dictionary (97k words)
- Game validation with Wordle-style feedback (green/yellow/gray)
- Physical + on-screen keyboard

## 🔄 Current Sprint (In Progress)

### 1. Game End Phonetic Reveal
**Status:** Starting
**Description:** When a player loses, show the pattern breakdown explaining the phonetic spelling.

**Example Output:**
```
The word was: FISH

Phonetically: GHOTI
  GH → "f" (from enough)
  O  → "i" (from women)
  TI → "sh" (from nation)
```

**Implementation Tasks:**
- Modify `/api/word/` endpoint to return phonetic patterns with each word
- Update loss modal to display pattern breakdown
- Test with multiple words to ensure clarity

**Backend Changes Needed:**
- `GET /api/word/` response should include pattern details, not just comma-separated string
- Query PhoneticComponent and PhoneticPattern relationships

**Frontend Changes Needed:**
- Parse pattern details from API response
- Render pattern breakdown in loss modal

**Decision:** Show reveal on **loss only** (for now). Can add educational reveal on win later.

---

### 2. Stats Display UI
**Status:** Starting
**Description:** Display player's statistics (win/loss record, current streak, win rate).

**Implementation Tasks:**
- Create stats section in UI (leaderboard/profile area)
- Fetch UserStats from backend
- Display: games played, wins, losses, current streak, win percentage

**Backend Changes Needed:**
- Add `/api/auth/me/stats/` endpoint to return UserStats with calculated win_rate
- Ensure UserStats is updated when player wins/loses

**Frontend Changes Needed:**
- Add stats component or modal
- Display stats after game completion

---

## 📋 Future Work (Post-MVP)

### High Priority - Required for Production Launch

#### Daily Word System (Develop Right Before Launch)
- **What:** Load today's puzzle from database instead of hardcoded "fish"
- **Why:** Essential for the actual game - can't launch without this
- **How:**
  - Modify `/api/word/` to query `Word.objects.get(date=today())`
  - Create 365+ day word dataset
  - Build `backend/data/load_additional_patterns.py` v2 for bulk loading
  - Add fallback if no word exists for today

---

### Medium Priority - Quality of Life

#### Leaderboard Display
- Visualize top players' win rates and streaks
- Show global/weekly/monthly stats

#### Share Results
- Copy emoji grid to clipboard (e.g., 🟩🟩🟩🟨🟩)
- Share to social media

#### Word Archive
- Play previous days' puzzles
- Review past solutions

#### Difficulty Filtering
- Filter by word length
- Filter by phonetic complexity

#### Onboarding Tutorial
- How to Play modal (already exists, maybe enhance)
- Example walkthrough

---

### Low Priority - Nice to Have

- Sound effects on correct/wrong guesses
- Dark/light mode toggle
- Animated letter reveals
- Browser notifications for daily puzzle
- Multiplayer/competitive mode
- Accessibility improvements

---

## 🐛 Known Issues

| Issue | Impact | Notes |
|-------|--------|-------|
| Loss modal doesn't show phonetic patterns | Medium | Only displays on win. Frontend logic needs fix for loss scenario |
| `/api/word/` hardcoded to "fish" | Critical | Blocks daily word system |
| No phonetic highlighting | Minor | Could highlight "ti" in GHOTI |
| Stats UI missing | Medium | Data exists, just no display |
| No automated tests | Medium | Frontend + backend need coverage |
| Constraint migration error | Resolved | Faked migration 0005, manually added columns |

---

## 🎯 Definition of Done (Current Sprint)

### Game End Reveal
- [ ] `/api/word/` returns pattern details
- [ ] Loss modal displays phonetic breakdown with reference words
- [ ] Tested with 3+ different words
- [ ] Clear and readable UI (no overflow/truncation)

### Stats Display
- [ ] Stats component/modal exists
- [ ] Displays games played, wins, losses, streak, win %
- [ ] Updates after each game
- [ ] Accessible to logged-in users

---

## 📊 Implementation Order

1. **Game End Reveal** (2-3 hours)
   - Backend: Modify word endpoint
   - Frontend: Parse and display patterns
   
2. **Stats Display** (2-3 hours)
   - Backend: Create stats endpoint
   - Frontend: Build stats UI

3. **Daily Word System** (before launch - higher complexity)
   - Create word dataset
   - Update word endpoint
   - Handle missing days gracefully

---

## 🔗 Related Files

**Backend:**
- `backend/game/views.py` - API endpoints
- `backend/game/models.py` - Word, PhoneticComponent models
- `backend/game/urls.py` - Route definitions

**Frontend:**
- `frontend/src/App.tsx` - Main game component
- `frontend/src/App.css` - Styling

**Database:**
- `database/schema.dbml` - Schema design
- `backend/data/load_additional_patterns.py` - Bulk data loader

---

## 📝 Notes

- Follow CLAUDE.md principles: Think Before Coding, Simplicity First, Surgical Changes
- Test API endpoints in Postman/browser before frontend integration
- Database migrations can be faked if needed for constraint mismatches
- Phonetic patterns table has 34+ loaded - sufficient for testing and early launch
- Keep word dataset organized (date order, validation)

---

**Last Updated:** February 9, 2026
**Next Review:** After completing Game End Reveal
