# Product Requirements Document (PRD)
## Project: **RecoverPath** — A GenAI-Powered Recovery & Prevention Platform

**Version:** 1.0
**Type:** Web Application (Responsive, Mobile-first)
**Owner:** Engineering / Product
**Status:** Ready for Build

---

## 1. Executive Summary

RecoverPath is a **multi-modal, GenAI-powered web platform** that supports individuals navigating substance use disorders (SUD) and the caregivers/family members who support them. The platform's defining principle is that **cognitive load is highest at the exact moment help is needed most** — during a craving, a relapse trigger, a panic moment, or a caregiver emergency. Traditional apps that require typing, navigating menus, or reading long-form content fail at this exact moment.

RecoverPath solves this with:

1. **Zero-typing interventions** — voice-first / one-tap flows powered by GenAI that require no typing during a crisis.
2. **Personalized emergency scripts** — GenAI-generated, context-aware scripts (what to say, what to do) generated in real time based on the user's profile, history, and current trigger.
3. **Educational resource hub** — curated + AI-summarized, evidence-based content on SUD, relapse prevention, and caregiving.
4. **Contextual safety tools** — location-aware, time-aware, and history-aware tools (grounding exercises, emergency contacts, nearest help, de-escalation flows) that adapt to the user's real situation.

This PRD strictly follows the priority order defined in `Rules.md`: **(1) Problem Alignment & Code Quality → (2) Security & Efficiency → (3) Testing & Accessibility**. Every feature listed below is scoped to be fully functional end-to-end, backed by a real database and a real GenAI API — no mock data, no fake AI, no static dashboards.

---

## 2. Problem Statement (Restated)

> Design and build a multi-modal, GenAI-powered recovery and prevention platform that supports individuals navigating substance use disorders and their caregivers, using generative AI as a core engine to provide zero-typing interventions, personalized emergency scripts, educational resources, and contextual safety tools — built for moments when cognitive load is highest.

### Core keywords → feature mapping

| Keyword in problem statement | Feature it maps to |
|---|---|
| Multi-modal | Voice input/output, tap-based UI, visual cards, minimal text |
| GenAI as core engine | Every dynamic response (scripts, summaries, check-ins, coping plans) is generated live via LLM API, not templated |
| Zero-typing interventions | "Panic Button" / "I Need Help Now" flow — entirely voice + tap |
| Personalized emergency scripts | AI generates scripts using user's trigger history, support contacts, coping preferences |
| Educational resources | AI-curated content hub, explain-like-I'm-in-crisis mode |
| Contextual safety tools | Location, time-of-day, streak/relapse-risk context injected into every AI call |
| Caregivers | Separate caregiver mode with its own zero-typing flows |
| Cognitive load highest | UI/UX designed around minimal decisions, large touch targets, voice-first |

---

## 3. Goals & Non-Goals

### 3.1 Goals
- Provide an individual in a craving/relapse-risk moment a **usable, zero-typing path to safety within 2 taps or 1 voice command**.
- Provide caregivers a **real-time, AI-generated script** to de-escalate or support their loved one without needing to know clinical language.
- Ground every AI output in the user's actual stored context (trigger history, support network, coping preferences) — not generic text.
- Maintain **clinical safety**: never provide dosage/drug-use instructions; always route active crisis signals to real crisis resources (988 Suicide & Crisis Lifeline, SAMHSA National Helpline 1-800-662-4357).
- Ship a **fully deployed, evaluator-testable** web app with seeded real accounts.

### 3.2 Non-Goals (Out of Scope for MVP)
- Native mobile apps (web-only, responsive/PWA-capable).
- Insurance billing / clinical diagnosis / prescribing.
- Peer-to-peer social network / public feed.
- Multi-language localization beyond English (stretch goal only).
- Wearable/IoT biometric integration (stretch goal only).

---

## 4. Target Users & Personas

### Persona 1 — "Maya," Person in Recovery (Primary)
- 29, 8 months sober from opioid use, high anxiety during trigger moments.
- Needs: instant grounding, a way to reach her sponsor/family without typing, non-judgmental education.
- Cognitive state during use: elevated heart rate, shaking hands, difficulty reading/typing.

### Persona 2 — "David," Caregiver / Family Member (Primary)
- 54, father of a son in early recovery. Doesn't know what to say when his son is in crisis.
- Needs: a script to say out loud, guidance on whether to call emergency services, education on enabling vs. supporting.

### Persona 3 — "Priya," Prevention-focused User (Secondary)
- 22, college student, family history of SUD, wants to understand risk and build preventive habits before any crisis exists.

### Persona 4 — Care Team / Sponsor (Secondary, view-only)
- Invited by the individual to receive escalation alerts (opt-in, consent-based).

---

## 5. Priority-Ordered Requirements (per Rules.md)

### Priority 1 — Problem Statement Alignment & Code Quality
- Every screen must map directly to one of the four pillars (zero-typing intervention, emergency scripts, education, contextual safety tools).
- No feature ships that isn't connected to a working backend + real AI call + real DB record.
- Clean separation: `frontend/`, `backend/api/`, `backend/services/ai/`, `backend/services/safety/`, `backend/db/`, `shared/types/`.

### Priority 2 — Security & Efficiency
- All inputs validated/sanitized server-side (zod/Joi schema validation).
- Secrets (LLM API key, DB creds, JWT secret) only in server-side env vars, never shipped to client.
- JWT-based auth with hashed passwords (bcrypt/argon2), HTTPS-only cookies.
- Rate-limiting on AI endpoints (prevent abuse + cost overrun).
- Response caching for static educational content; streaming responses for AI scripts to reduce perceived latency.
- Debounce/guard duplicate AI calls (idempotency key per crisis session).

### Priority 3 — Testing & Accessibility
- Unit tests for AI prompt-builder, safety-classifier, and script-formatter modules.
- Integration tests for the full "Panic Button" flow (voice input → intent → AI script → contact dispatch).
- WCAG 2.1 AA: large touch targets (min 44x44px), voice control, screen-reader labels, high-contrast "Crisis Mode" theme, full keyboard navigation.

---

## 6. Core Features (Detailed)

### 6.1 Zero-Typing Crisis Intervention ("I Need Help Now")
**User flow (individual):**
1. One large, always-visible button (bottom nav, thumb-reachable) — or voice wake phrase ("Help me now") via Web Speech API.
2. App asks 1–2 spoken/tappable multiple-choice questions max (e.g., "Are you safe right now?" [Yes/No], "What's happening?" [Craving / Anxious / Just used / Thinking about using]) — answered by tap or voice, never typed.
3. GenAI receives: answer + user's stored trigger history + time of day + coping preferences → generates a **real-time grounding response** (breathing exercise, distraction activity, or direct script) read aloud via Text-to-Speech.
4. If risk signals indicate active danger → immediately surface crisis hotline numbers as a **persistent, non-dismissible action card**, in addition to AI content (never gated behind more AI generation).
5. One tap to "Notify My Support Contact" — sends a pre-approved SMS/email (via Twilio/SendGrid) with a caregiver-appropriate context summary (not raw personal data — a safety-filtered handoff).

**Backend requirement:** This entire flow must complete in under ~5 seconds end-to-end (streaming AI response), with graceful fallback content if the AI API fails (never a blank/broken screen).

### 6.2 Personalized Emergency Scripts (Caregiver Mode)
- Caregiver taps "My loved one needs help" → selects a real-time situation (tap-based: "They seem high/intoxicated," "They're withdrawing," "They're emotionally distressed," "I found paraphernalia") — zero typing required.
- GenAI generates a **personalized script** the caregiver can literally read aloud, using:
  - The relationship (parent/spouse/sibling/friend — set once in profile)
  - The individual's known triggers/history (with consent-based data sharing)
  - De-escalation best practices (grounded via a curated prompt template, not hallucinated clinical claims)
- Script includes: opening line, what NOT to say, when to call 911/988, and a calm closing line.
- Every script explicitly avoids providing medical/dosage instructions (hardcoded guardrail in the AI system prompt + output-side safety filter).

### 6.3 Educational Resource Hub
- Structured, evidence-based content library (seeded from real public-domain sources: SAMHSA, NIDA, NIH) stored in the database — not fabricated.
- GenAI acts as a **contextual explainer layer on top of real content**: user can ask "explain this in 1 sentence" or "explain this for a teenager" and the AI reformulates the *stored* factual content — it does not invent new medical facts.
- Bite-sized, swipeable "Learn in 60 seconds" cards for high-cognitive-load users.
- Search bar (optional typing path) + tap-based topic browsing (zero-typing path) for accessibility.

### 6.4 Contextual Safety Tools
- **Risk-context engine**: combines time of day, day-of-week, user-reported streak, and past logged trigger patterns to proactively surface tools (e.g., Friday 9pm historically high-risk → app proactively surfaces a check-in notification).
- **Grounding toolkit**: breathing timer, 5-4-3-2-1 sensory grounding, guided audio — all instantly accessible with one tap, no AI dependency (must work even if AI API is down).
- **Nearest help locator**: (with user permission) shows nearby meetings/treatment centers using a real maps/places API.
- **Safety plan builder**: AI helps the user co-create a written safety plan during a *calm* moment (typing allowed here, since cognitive load is low), which is then surfaced verbatim (not regenerated) during a crisis for reliability and speed.

### 6.5 Caregiver Dashboard (Consent-Based)
- Shows only what the individual has explicitly opted to share (streak status, last check-in, whether they triggered a "Help Now" flow — never raw chat/voice logs).
- Real-time alert when the individual dispatches a "Notify My Support Contact" event.

---

## 7. AI Architecture

### 7.1 Principles
- **Real model calls only.** Every AI-labeled feature calls a genuine LLM API server-side; no hardcoded/templated responses presented as AI-generated.
- **Context-grounded generation.** Every prompt is assembled server-side from real DB fields (user profile, trigger history, relationship type, time/location) — never a static prompt with no user context.
- **Safety-layered output.** All AI responses pass through a server-side safety classifier before being shown:
  - Block/redirect any dosage, drug-sourcing, or self-harm-method content.
  - Detect active crisis/suicidal-ideation language → override normal response with crisis-resource card.
- **Streaming responses** for perceived speed during high-stress moments (SSE or streaming fetch).
- **Graceful degradation**: if the AI API errors or times out, fallback to a small set of safety-reviewed static grounding scripts stored in DB (clearly a resiliency measure, not "fake AI" — the primary path is always live AI).

### 7.2 Example System Prompt Skeleton (Emergency Script Generator)
```
You are a calm, trauma-informed assistant helping a caregiver support
someone who may be in a substance-use-related crisis.

Context:
- Caregiver relationship: {{relationship}}
- Situation reported: {{situation_type}}
- Known individual triggers (if shared): {{trigger_context}}
- Time of day: {{local_time}}

Rules:
- Never provide dosage, drug-use, or drug-sourcing instructions.
- Always include a clear line on when to call 911 or 988.
- Keep language calm, short, and speakable aloud (max 120 words).
- If any content suggests immediate danger to life, prioritize
  emergency-service guidance above all else.

Output format: JSON { opening_line, do_say[], avoid_saying[], escalation_line, closing_line }
```

### 7.3 Suggested Model
- Any production-grade hosted LLM API (e.g., Claude via Anthropic API) with server-side key storage. Model choice is an implementation detail; the requirement is a **real, live API call**, not a stub.

---

## 8. User Journeys (End-to-End)

### Journey A — Individual in Crisis (Zero-Typing)
Open app → tap/say "Help Now" → tap 1–2 context buttons → AI streams grounding script (voice + text) → persistent crisis-hotline card visible throughout → optional 1-tap "Notify Contact" → session logged → caregiver dashboard updates in real time.

### Journey B — Caregiver Needs a Script
Open app (caregiver mode) → tap "They need help now" → tap situation type → AI generates personalized script → caregiver taps "Read Aloud" (TTS) or reads on screen → optional 1-tap "Call 988" / "Call 911" → outcome logged (optional, consent-based) for future context.

### Journey C — Preventive Learning
Browse/search education hub → tap a topic card → AI reformulates real stored content to reading level/context → complete a "60-second lesson" → streak/engagement tracked on real dashboard.

### Journey D — Calm-State Safety Plan Setup
User in a stable moment → guided AI conversation (typing allowed) → co-creates a safety plan (contacts, coping steps, warning signs) → saved to DB → this exact plan is what surfaces instantly during Journey A, ensuring reliability under stress.

---

## 9. Data Model (High-Level)

| Entity | Key Fields |
|---|---|
| `User` | id, role (individual/caregiver), email, password_hash, created_at |
| `Profile` | user_id, display_name, relationship_map, streak_start_date, sobriety_goal |
| `TriggerHistory` | user_id, trigger_type, timestamp, resolved_bool, notes(optional) |
| `SafetyPlan` | user_id, coping_steps[], warning_signs[], support_contacts[], created_via_ai (bool) |
| `SupportContact` | user_id, contact_name, phone/email, consent_scope, relationship |
| `CrisisSession` | id, user_id, trigger_context, ai_response_id, resolved_bool, notified_contact_bool, timestamp |
| `EmergencyScript` | id, caregiver_id, individual_id (optional), situation_type, ai_output_json, timestamp |
| `EducationContent` | id, title, source, body, tags[], reading_level_variants (AI-cached) |
| `CaregiverLink` | caregiver_id, individual_id, consent_scope, status |

All tables in a real relational DB (PostgreSQL recommended) with proper foreign keys, indices on `user_id` and `timestamp` fields used for the risk-context engine.

---

## 10. Recommended Tech Stack

| Layer | Recommendation |
|---|---|
| Frontend | React (Vite) + TypeScript, Tailwind CSS, PWA-enabled |
| Voice I/O | Web Speech API (SpeechRecognition + SpeechSynthesis), with graceful fallback to tap-only UI on unsupported browsers |
| Backend | Node.js (Express/Fastify) or equivalent, TypeScript |
| Database | PostgreSQL (managed, e.g., Supabase/Neon/RDS) |
| Auth | JWT + bcrypt/argon2, HTTP-only secure cookies |
| AI | Server-side calls to a hosted LLM API (key stored in server env only) |
| Notifications | Twilio (SMS) / SendGrid (email) for "Notify Contact" flow |
| Maps/Places | Google Places API or Mapbox for "Nearest Help" |
| Hosting | Vercel/Netlify (frontend) + Render/Railway/Fly.io (backend) or a single full-stack host |
| Monitoring | Basic error logging (Sentry) — required for "handle API failures gracefully" |

---

## 11. Non-Functional Requirements

### Security
- All AI/API routes require authentication except public educational content.
- Input validation & sanitization on every endpoint (server-side schema validation).
- No secrets in client bundle — verified via build check.
- HTTPS enforced; secure, http-only, same-site cookies for sessions.
- Consent-based data sharing between individual and caregiver accounts — explicit opt-in, revocable at any time.

### Performance
- Crisis flow (Journey A) must render first meaningful content in <2s and complete AI streaming in <5s on 4G.
- Educational content cached (CDN/DB-level) to avoid duplicate AI reformulation calls for identical (content_id, reading_level) pairs.
- Lazy-load non-critical routes (education hub, dashboard analytics) to keep the crisis flow bundle minimal.

### Accessibility
- Full keyboard navigation and visible focus states.
- ARIA labels on all icon-only buttons (especially the Help Now button).
- Minimum 44x44px touch targets throughout.
- Color contrast ≥ 4.5:1; a dedicated high-contrast "Crisis Mode" visual theme.
- Voice-first parity: every zero-typing action must also be tap-accessible for non-voice users, and vice versa.

### Testing
- Unit tests: prompt builder, safety classifier, script formatter, risk-context engine.
- Integration test: full crisis flow from trigger tap → AI response → contact notification (mocked provider in test env only, real provider in production).
- Manual QA checklist covering every item in Rules.md's "Testing Checklist."

---

## 12. Safety, Ethics & Compliance Considerations

- The platform is a **support and education tool**, not a medical device — this must be stated clearly in an onboarding disclaimer and footer.
- No feature should ever request or display drug dosage, sourcing, or use-technique information — enforced both in system prompts and via a post-generation content filter.
- Any detected active self-harm/suicidal-ideation signal in user input **overrides all other AI generation** and immediately surfaces: **988 Suicide & Crisis Lifeline** and **SAMHSA National Helpline (1-800-662-4357)**, alongside a calm, non-judgmental message — never a dead end.
- All caregiver visibility into an individual's data is **explicit, scoped, and revocable consent** — never default-on.
- Store the minimum data necessary; allow account/data deletion (basic "right to be forgotten" support).

---

## 13. MVP Scope vs. Stretch Goals

### MVP (must ship, fully working)
- Auth (individual + caregiver roles)
- Zero-typing "Help Now" flow with real AI + fallback
- Caregiver "Emergency Script" generator
- Education hub (min. 10 real seeded articles) with AI reading-level reformulation
- Safety plan builder (calm-state) + instant surfacing in crisis flow
- Consent-based caregiver linking + notification dispatch
- Crisis hotline card (always accessible, one tap from anywhere)

### Stretch Goals (if time permits)
- Risk-context proactive notifications (time/pattern-based nudges)
- Nearest-help map integration
- Multi-language support
- Voice-only "hands-free mode" for the entire crisis flow
- Analytics dashboard for care teams (aggregate, anonymized)

---

## 14. Success Metrics (for demo/evaluation)

| Metric | Target |
|---|---|
| Crisis flow completion without typing | 100% of steps tap/voice only |
| AI response is live/genuine (not hardcoded) | Verifiable via network inspection during evaluator test |
| End-to-end feature functionality | Every listed MVP feature works with real backend + DB |
| Time to first AI response in crisis flow | < 5 seconds |
| Accessibility audit (Lighthouse/axe) | ≥ 90 score |
| Evaluator can log in and test every role | Individual + caregiver demo credentials provided |

---

## 15. Deployment & Evaluator Access Checklist

- [ ] Publicly accessible URL (frontend + backend live)
- [ ] Real database connected (no local-only/mock DB)
- [ ] Real AI API connected with working key (server-side)
- [ ] Working authentication for both roles
- [ ] Seed data: at least 1 demo **individual** account and 1 demo **caregiver** account, pre-linked with consent, so the evaluator can test the full caregiver-notification loop without setup friction
- [ ] Evaluator credentials documented (email/password for both roles)
- [ ] No broken pages/dead buttons anywhere in the app
- [ ] Crisis hotline resources visibly present and never gated behind a broken flow

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI API downtime during evaluation | Safety-reviewed static fallback content for grounding/crisis flow only (clearly a resiliency layer, primary path is live AI) |
| Evaluator perceives AI as "faked" | Ensure responses are visibly non-deterministic/context-specific; log real API calls |
| Sensitive-topic content flags on hosting/App review | Clear in-app disclaimers, crisis-resource-first design, no medical claims |
| Scope creep beyond 4 core pillars | Re-check every feature against Section 6 mapping before building |
| Caregiver data misuse | Strict consent scoping, revocable access, minimal data exposure by default |

---

## 17. Golden Rule (per Rules.md)

> Build fewer features that work perfectly, all real, all connected to a live backend and live GenAI, all directly aligned to: zero-typing interventions, personalized emergency scripts, educational resources, and contextual safety tools for individuals and caregivers navigating substance use disorder.
