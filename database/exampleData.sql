-- ============================================
-- GHOTIDLE SAMPLE DATA (with proper quoting)
-- ============================================

-- Clear existing data
DELETE FROM "phoneticComponent";
DELETE FROM "word";
DELETE FROM "phoneticPattern";

-- Reset sequences
ALTER SEQUENCE "phoneticPattern_id_seq" RESTART WITH 1;
ALTER SEQUENCE "word_id_seq" RESTART WITH 1;

-- ============================================
-- PHONETIC PATTERNS
-- ============================================

INSERT INTO "phoneticPattern" (letters, sound, reference) VALUES
('gh', 'f', 'rough'),
('o', 'i', 'women'),
('ti', 'sh', 'nation'),
('t', 'ch', 'picture'),
('olo', 'ur', 'colonel'),
('ho', 'wuh-y', 'choir'),
('o', 'wuh', 'one'),
('ed', 't', 'hacked'),
('eye', 'ay', 'eye'),
('oir', 'way-er', 'choir'),
('ipt', 'eet', 'receipt'),
('dnes', 'z', 'wednesday'),
('gna', 'ni', 'bologna'),
('ai', 'e', 'said'),
('oes', 'az', 'does'),
('do', 'da', 'does'),
('oo', 'a', 'blood');

-- ============================================
-- WORDS
-- ============================================

INSERT INTO "word" (secret, phonetic, date) VALUES
('fish', 'ghoti', '2025-12-15'),
('church', 'tolot', '2025-12-16'),
('why', 'ho', '2025-12-17'),
('what', 'oed', '2025-12-18');

-- ============================================
-- PHONETIC COMPONENTS
-- ============================================

-- fish → ghoti (gh + o + ti)
INSERT INTO "phoneticComponent" ("wordId", "patternId") VALUES
(1, 1), (1, 2), (1, 3);

-- church → tolot (t + olo + t)
INSERT INTO "phoneticComponent" ("wordId", "patternId") VALUES
(2, 4), (2, 5);

-- why → ho
INSERT INTO "phoneticComponent" ("wordId", "patternId") VALUES
(3, 6);

-- what → oed (o + ed)
INSERT INTO "phoneticComponent" ("wordId", "patternId") VALUES
(4, 7), (4, 8);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT * FROM "word" ORDER BY date;
SELECT * FROM "phoneticPattern" ORDER BY id;