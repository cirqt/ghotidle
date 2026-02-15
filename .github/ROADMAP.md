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
- **Game End Phonetic Reveal** - Shows pattern breakdown on win/loss

## 🔄 Current Sprint (In Progress)

### Stats Display UI
**Status:** Next Up
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
| `/api/word/` hardcoded to "fish" | Critical | Blocks daily word system |
| No phonetic highlighting | Minor | Could highlight "ti" in GHOTI |
| Stats UI missing | Medium | Data exists, just no display |
| No automated tests | Medium | Frontend + backend need coverage |
| Constraint migration error | Resolved | Faked migration 0005, manually added columns |

---

## 🎯 Definition of Done (Current Sprint)

### Stats Display
- [ ] Stats component/modal exists
- [ ] Displays games played, wins, losses, streak, win %
- [ ] Updates after each game
- [ ] Accessible to logged-in users

---

## 📊 Implementation Order

1. ~~**Game End Reveal**~~ ✅ **COMPLETED** (Feb 15, 2026)
   - Backend: Already returns pattern details in `/api/word/` endpoint
   - Frontend: Added game end modal showing phonetic breakdown on win/loss
   - Time: ~1 hour
   
2. **Stats Display** (Next - 2-3 hours)
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

**Last Updated:** February 15, 2026
**Next Review:** After completing Stats Display UI
