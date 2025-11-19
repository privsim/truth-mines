# How to Request Gemini 3 Pro Review

## Quick Start

**Copy and paste this message to Gemini 3 Pro:**

---

I'm working on Truth Mines (the epistemic knowledge graph you reviewed previously). Your feedback was excellent and we've implemented all your Top 5 priorities!

Now we're polishing the 2D interactive visualization and need your review of three new specifications before we implement them with strict TDD.

**Please review these 4 documents:**

1. **Review Request** (this document) - Context and specific questions
2. **FOCUS_PATH_SPEC.md** - Algorithm for epistemic justification chains
3. **NODEDETAIL_TABS_SPEC.md** - Tab design for node detail panel
4. **TENSION_VISUAL_SPEC.md** - Visual encoding for your tension metric

**I'll paste each document below, then ask for your structured review.**

---

[PASTE CONTENTS OF: docs/review-requests/2D_POLISH_REVIEW.md]

---

[PASTE CONTENTS OF: docs/FOCUS_PATH_SPEC.md]

---

[PASTE CONTENTS OF: docs/NODEDETAIL_TABS_SPEC.md]

---

[PASTE CONTENTS OF: docs/TENSION_VISUAL_SPEC.md]

---

**Please provide structured feedback following the format suggested in 2D_POLISH_REVIEW.md:**
- Executive Summary (top 3 priorities)
- Algorithmic Recommendations (shortest vs strongest, bridges, coherentism)
- UX Design Feedback (tabs, visuals, information hierarchy)
- Philosophical Validation (correctness, edge cases)
- Implementation Priorities (what to build first, defer, or cut)
- Specific Answers to the 14+ questions

Thank you! Your previous review was invaluable.

---

## Files to Copy-Paste

**All files are in:** `/Users/lclose/truth-mines/docs/`

1. `review-requests/2D_POLISH_REVIEW.md` (main request)
2. `FOCUS_PATH_SPEC.md` (algorithm spec)
3. `NODEDETAIL_TABS_SPEC.md` (UI spec)
4. `TENSION_VISUAL_SPEC.md` (visual design spec)

## Expected Response

Gemini should return structured markdown with:
- Recommendations on algorithm choices
- UX guidance on tabs and visual encodings
- Philosophical validation of approach
- Specific answers to our 14 questions
- Implementation priorities

## What to Do With Response

1. Save Gemini's response to: `docs/review-requests/GEMINI_2D_REVIEW_RESPONSE.md`
2. Share with me (Claude)
3. I'll integrate feedback into specs
4. We'll proceed with TDD implementation

---

**Estimated review time:** 10-15 minutes for Gemini to read and respond
**Estimated integration time:** 30 minutes for us to update specs
**Then:** Ready for strict TDD implementation!

---
