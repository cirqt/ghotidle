import React, { useState } from 'react';

interface ScheduleWord {
  id: number;
  secret: string;
  phonetic: string;
  date: string; // YYYY-MM-DD
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminMode: 'word' | 'pattern' | 'schedule';
  onSelectMode: (mode: 'word' | 'pattern' | 'schedule') => void;
  adminError: string;
  adminSuccess: string;
  adminSecret: string;
  adminPhonetic: string;
  adminSounds: string;
  onAdminSecretChange: (value: string) => void;
  onAdminPhoneticChange: (value: string) => void;
  onAdminSoundsChange: (value: string) => void;
  onAdminSubmit: (event: React.FormEvent) => void;
  onRandomWord: () => void;
  isLoadingPatterns: boolean;
  suggestedPatterns: any[];
  noChangeSoundIndexes: number[];
  selectedPatterns: number[];
  onToggleNoChangeForSound: (soundIndex: number, patternIds: number[]) => void;
  setSelectedPatterns: React.Dispatch<React.SetStateAction<number[]>>;
  setNoChangeSoundIndexes: React.Dispatch<React.SetStateAction<number[]>>;
  patternLetters: string;
  patternSound: string;
  patternReference: string;
  onPatternLettersChange: (value: string) => void;
  onPatternSoundChange: (value: string) => void;
  onPatternReferenceChange: (value: string) => void;
  onPatternSubmit: (event: React.FormEvent) => void;
  scheduleWords: ScheduleWord[];
  onReschedule: (wordId: number, newDate: string) => void;
}

function AdminModal({
  isOpen,
  onClose,
  adminMode,
  onSelectMode,
  adminError,
  adminSuccess,
  adminSecret,
  adminPhonetic,
  adminSounds,
  onAdminSecretChange,
  onAdminPhoneticChange,
  onAdminSoundsChange,
  onAdminSubmit,
  onRandomWord,
  isLoadingPatterns,
  suggestedPatterns,
  noChangeSoundIndexes,
  selectedPatterns,
  onToggleNoChangeForSound,
  setSelectedPatterns,
  setNoChangeSoundIndexes,
  patternLetters,
  patternSound,
  patternReference,
  onPatternLettersChange,
  onPatternSoundChange,
  onPatternReferenceChange,
  onPatternSubmit,
  scheduleWords,
  onReschedule,
}: AdminModalProps) {
  if (!isOpen) return null;

  // Calendar state
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [reassignWordId, setReassignWordId] = useState<string>('');

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build a map of date -> word for quick lookup
  const dateMap: Record<string, ScheduleWord> = {};
  scheduleWords.forEach(w => { dateMap[w.date] = w; });

  // Days in month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const formatDate = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const todayStr = today.toISOString().split('T')[0];
  const selectedWord = selectedDay ? dateMap[selectedDay] : null;
  const unscheduledWords = scheduleWords.filter(w => !w.date || w.date < todayStr);

  const handleReassign = () => {
    if (!selectedDay || !reassignWordId) return;
    onReschedule(parseInt(reassignWordId), selectedDay);
    setReassignWordId('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Admin Panel</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${adminMode === 'word' ? 'active' : ''}`}
            onClick={() => onSelectMode('word')}
          >
            Add Word
          </button>
          <button
            className={`admin-tab ${adminMode === 'pattern' ? 'active' : ''}`}
            onClick={() => onSelectMode('pattern')}
          >
            Add Pattern
          </button>
          <button
            className={`admin-tab ${adminMode === 'schedule' ? 'active' : ''}`}
            onClick={() => onSelectMode('schedule')}
          >
            📅 Schedule
          </button>
        </div>

        <div className="modal-body">
          {adminError && <div className="error-message">{adminError}</div>}
          {adminSuccess && <div className="success-message">{adminSuccess}</div>}

          {adminMode === 'word' && (
            <form className="admin-form" onSubmit={onAdminSubmit}>
              <div className="form-group">
                <label htmlFor="secret">Standard Spelling</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="secret"
                    placeholder="e.g., fish"
                    maxLength={50}
                    value={adminSecret}
                    onChange={(e) => onAdminSecretChange(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={onRandomWord}
                    className="random-word-button"
                    title="Get random word"
                  >
                    🎲
                  </button>
                </div>
                <span className="form-hint">The correct spelling players need to guess</span>
              </div>

              <div className="form-group">
                <label htmlFor="phonetic">Phonetic Spelling</label>
                <input
                  type="text"
                  id="phonetic"
                  placeholder="e.g., ghoti"
                  maxLength={50}
                  value={adminPhonetic}
                  onChange={(e) => onAdminPhoneticChange(e.target.value)}
                />
                <span className="form-hint">The unconventional phonetic spelling to display</span>
              </div>

              <div className="form-group">
                <label htmlFor="sounds">How It Sounds (with hyphens)</label>
                <input
                  type="text"
                  id="sounds"
                  placeholder="e.g., f-i-sh"
                  maxLength={100}
                  value={adminSounds}
                  onChange={(e) => onAdminSoundsChange(e.target.value)}
                />
                <span className="form-hint">
                  Separate each sound with a hyphen (e.g., "f-i-sh", "n-ay-sh-un")
                </span>
              </div>

              {isLoadingPatterns && (
                <div className="pattern-loading">Finding matching patterns...</div>
              )}

              {suggestedPatterns.length > 0 && (
                <div className="pattern-suggestions">
                  <h3>Suggested Phonetic Patterns:</h3>
                  {suggestedPatterns.map((sound, soundIndex) => (
                    <div key={soundIndex} className="sound-group">
                      <h4>Sound: "{sound.sound}"</h4>
                      <div className="pattern-options">
                        <label className="pattern-option no-change-option">
                          <input
                            type="checkbox"
                            checked={noChangeSoundIndexes.includes(soundIndex)}
                            onChange={() =>
                              onToggleNoChangeForSound(
                                soundIndex,
                                sound.patterns.map((pattern: any) => pattern.id)
                              )
                            }
                          />
                          <span className="pattern-letters">✓</span>
                          <span className="pattern-sound">Keep as-is</span>
                          <span className="pattern-reference">
                            (no replacement for this sound)
                          </span>
                        </label>

                        {sound.patterns.length > 0 ? (
                          sound.patterns.map((pattern: any) => (
                            <label key={pattern.id} className="pattern-option">
                              <input
                                type="checkbox"
                                checked={selectedPatterns.includes(pattern.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPatterns([...selectedPatterns, pattern.id]);
                                    setNoChangeSoundIndexes(
                                      noChangeSoundIndexes.filter(
                                        (index) => index !== soundIndex
                                      )
                                    );
                                  } else {
                                    setSelectedPatterns(
                                      selectedPatterns.filter((id) => id !== pattern.id)
                                    );
                                  }
                                }}
                              />
                              <span className="pattern-letters">{pattern.letters}</span>
                              <span className="pattern-arrow">→</span>
                              <span className="pattern-sound">{pattern.sound}</span>
                              <span className="pattern-reference">
                                (from "{pattern.reference}")
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="no-patterns">
                            No patterns found for "{sound.sound}". You may need to add this
                            pattern first.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="submit-button">
                Add Word
              </button>
            </form>
          )}

          {adminMode === 'pattern' && (
            <form className="admin-form" onSubmit={onPatternSubmit}>
              <div className="form-group">
                <label htmlFor="pattern-letters">Letter Combination</label>
                <input
                  type="text"
                  id="pattern-letters"
                  placeholder="e.g., ti, gh, ph"
                  maxLength={10}
                  value={patternLetters}
                  onChange={(e) => onPatternLettersChange(e.target.value)}
                />
                <span className="form-hint">The letters that make the sound (max 10 chars)</span>
              </div>

              <div className="form-group">
                <label htmlFor="pattern-sound">Sound It Makes</label>
                <input
                  type="text"
                  id="pattern-sound"
                  placeholder="e.g., sh, f, i"
                  maxLength={10}
                  value={patternSound}
                  onChange={(e) => onPatternSoundChange(e.target.value)}
                />
                <span className="form-hint">The phonetic sound produced (max 10 chars)</span>
              </div>

              <div className="form-group">
                <label htmlFor="pattern-reference">Reference Word</label>
                <input
                  type="text"
                  id="pattern-reference"
                  placeholder="e.g., nation, enough, women"
                  maxLength={50}
                  value={patternReference}
                  onChange={(e) => onPatternReferenceChange(e.target.value)}
                />
                <span className="form-hint">An example word where this pattern appears</span>
              </div>

              <div className="pattern-example">
                <strong>Example:</strong> In "nation", the letters "ti" make the sound "sh"
              </div>

              <button type="submit" className="submit-button">
                Add Pattern
              </button>
            </form>
          )}
          {adminMode === 'schedule' && (
            <div className="schedule-container">
              {/* Month navigation */}
              <div className="calendar-nav">
                <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))}>◀</button>
                <span>{monthName}</span>
                <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))}>▶</button>
              </div>

              {/* Weekday headers */}
              <div className="calendar-grid">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="calendar-header-cell">{d}</div>
                ))}

                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="calendar-cell empty" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDate(day);
                  const word = dateMap[dateStr];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDay;
                  return (
                    <div
                      key={day}
                      className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${word ? 'has-word' : ''}`}
                      onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    >
                      <span className="day-number">{day}</span>
                      {word && <span className="day-word">{word.secret}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Selected day detail */}
              {selectedDay && (
                <div className="calendar-detail">
                  <h4>{selectedDay}</h4>
                  {selectedWord ? (
                    <p>Assigned: <strong>{selectedWord.secret}</strong> ({selectedWord.phonetic})</p>
                  ) : (
                    <p>No word assigned for this day.</p>
                  )}
                  <div className="reassign-row">
                    <select
                      value={reassignWordId}
                      onChange={e => setReassignWordId(e.target.value)}
                    >
                      <option value="">— assign a word —</option>
                      {scheduleWords.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.secret} ({w.phonetic}) — {w.date}
                        </option>
                      ))}
                    </select>
                    <button
                      className="submit-button"
                      onClick={handleReassign}
                      disabled={!reassignWordId}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
