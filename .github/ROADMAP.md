# Ghotidle Development Roadmap (March 2026)

## ✅ Completed Features
- User authentication (register, login, logout, password reset UI ⚠️ email not yet real)
- Admin panel for creating words and patterns
- 34+ phonetic patterns loaded
- Pattern suggestion engine (type sounds → see matching patterns)
- "Keep as-is" checkbox for sounds without replacement
- Valid word dictionary (97k words)
- Game validation with Wordle-style feedback (green/yellow/gray)
- Physical + on-screen keyboard
- **Game End Phonetic Reveal** - Shows pattern breakdown on win/loss
- **Leaderboard Display** - Top players' win rates and streaks
- **Share Results** - Copy emoji grid to clipboard
- **Stats Display** - Games, wins, losses, streak, win rate (UserModal + LeaderboardModal)
- **Production Infrastructure** - All hardcoded URLs/secrets moved to environment variables

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

#### Real Email Delivery (SMTP)
- **What:** Password reset emails currently only print to the terminal (console backend)
- **Why:** Users can't actually receive reset emails — broken feature in production
- **How:**
  - Switch `EMAIL_BACKEND` in `settings.py` to `smtp.EmailBackend`
  - Configure Gmail SMTP (already stubbed out in settings.py, just commented out)
  - Set `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` as environment variables
  - Get a Gmail App Password from https://myaccount.google.com/apppasswords (requires 2FA)
  - Update the reset link domain from `localhost:3000` to production domain in `views.py`

#### ~~Production Infrastructure~~ ✅ COMPLETED
- All hardcoded `localhost` URLs/secrets moved to environment variables

---

### Medium Priority - Quality of Life

#### ✅ Leaderboard Display
- Visualize top players' win rates and streaks
- Show global/weekly/monthly stats

#### ✅ Share Results
- Copy emoji grid to clipboard (e.g., 🟩🟩🟩🟨🟩)

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
| Password reset email not sent | Critical | Console backend only - prints to terminal |
| No phonetic highlighting | Minor | Could highlight "ti" in GHOTI |
| No automated tests | Medium | Frontend + backend need coverage |

---

## 🎯 Definition of Done (Current Sprint)

### Daily Word System
- [ ] `/api/word/` queries DB by today's date
- [ ] Fallback if no word exists for today
- [ ] Word dataset loaded for 365+ days

### Real Email Delivery
- [ ] Gmail SMTP configured in settings.py
- [ ] `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` set as env vars
- [ ] Reset link domain updated to production domain
- [ ] Tested end-to-end (request → email received → password changed)

---

## 📊 Implementation Order

1. ~~**Game End Reveal**~~ ✅ **COMPLETED** (Feb 15, 2026)
   - Backend: Already returns pattern details in `/api/word/` endpoint
   - Frontend: Added game end modal showing phonetic breakdown on win/loss

2. ~~**Stats Display**~~ ✅ **COMPLETED** (Mar 7, 2026)
   - Stats shown in UserModal (Account Settings) and LeaderboardModal

3. **Daily Word System** (before launch)
   - Create word dataset
   - Update word endpoint
   - Handle missing days gracefully

4. **Real Email Delivery** (before launch)
   - Switch to Gmail SMTP backend
   - Configure credentials as env vars

5. ~~**Production Infrastructure**~~ ✅ **COMPLETED** (Mar 7, 2026)
   - All hardcoded `localhost` URLs replaced with env vars (`REACT_APP_API_URL`, `FRONTEND_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`)
   - `DEBUG` and `SESSION_COOKIE_SECURE` read from env vars

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

**Last Updated:** March 7, 2026
**Next Review:** After completing Daily Word System
