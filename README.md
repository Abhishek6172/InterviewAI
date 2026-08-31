# InterviewAI

> **Tagline:** Practice interviews with an AI interviewer that adapts to you.

---

## 1. Problem

**Interview practice is easy to do badly.**

Most candidates prepare for competitive technical, behavioral, and system design interviews by passively reading static question banks (e.g., LeetCode text discussions, PDF cheat sheets, or static Flashcards). 

When faced with a real interview, candidates struggle because:
1. **Lack of Conversational Pressure:** Articulating complex technical trade-offs out loud under observation feels fundamentally different from silently reading solutions.
2. **Absence of Dynamic Probing:** Static lists cannot follow up when an answer is ambiguous, missing metrics, or lacking depth.
3. **Unstructured Feedback:** Peer mock interviews are difficult to schedule, inconsistent in quality, and rarely provide structured, actionable evaluations mapped to industry rubrics.
4. **Weak-Area Blindspots:** Candidates cannot objectively determine whether their primary vulnerability is communication structure (STAR), technical accuracy, relevance, or clarity.

---

## 2. Target User

- **Primary:** Computer Science and Engineering students, bootcamp graduates, and self-taught developers preparing for Junior to Mid-level tech roles.
- **Secondary:** Early-career Product Managers, Data Analysts, and UX Designers transitioning into technical disciplines.

---

## 3. Solution

**InterviewAI** provides an interactive mock interview environment where candidates converse with an intelligent AI avatar that:
- Adapts questions dynamically to the candidate's chosen role, seniority, and responses.
- Actively listens, speaks, and analyzes speech pacing and technical content in real time.
- Asks natural, context-aware follow-up questions when a candidate mentions specific projects or architectures.
- Generates an evidence-based performance scorecard evaluating 5 core dimensions: *Communication*, *Technical Depth*, *Relevance*, *Clarity*, and *Confidence*.
- Recommends concrete next steps and highlights specific strengths and areas for improvement.

---

## 4. Why AI Avatar

**Instead of reading another list of questions, you practice in a conversational interview environment.**

Text-based chatbots and static question banks fail to simulate the human presence of an interviewer. The AI avatar serves as the visual and auditory focal point, providing:
- **Visual Presence & Attentiveness:** Clearly communicates distinct states (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`) so the candidate feels actively observed.
- **Auditory Engagement:** Delivers questions via natural text-to-speech synthesis, training candidates to process verbal prompts.
- **Speech Cadence Training:** Encourages verbal responses using browser speech recognition, conditioning candidates to speak succinctly within the ideal 90–120 second window.

---

## 5. Core User Flow

```
Landing Page (Problem & Solution Overview, Live Avatar Demo)
    ↓
Interview Setup (Select Role, Difficulty, Style, Experience Level, Question Count)
    ↓
Interactive Session (AI Avatar reads question → Candidate responds via Voice or Text)
    ↓
Real-Time Analysis & Contextual Follow-Up (AI probes for technical depth)
    ↓
Interview Completion
    ↓
Performance Scorecard (Overall Score 1-100, 5-Dimension Metrics, Strengths & Next Steps)
    ↓
Question-by-Question Review (What was good / What could improve)
    ↓
User Validation Feedback (Thumbs Up/Down, Realism Rating, Qualitative Suggestions)
    ↓
Retry Option (Start another customized mock session)
```

---

## 6. Features

- **Dynamic Question Generator:** Generates role-specific questions for Software Engineers, Frontend, Backend, Data Analysts, Product Managers, and Custom Roles.
- **Interactive State Machine Avatar:** Responsive visual transitions across Idle, Listening (waveform ripples), Thinking (neural vortex), and Speaking (audio bar visualizer).
- **Dual-Mode Voice & Text Input:** Browser Web Speech API transcription with real-time editable preview + text input fallback for unsupported devices.
- **Text-to-Speech Output:** Browser speech synthesis delivering realistic spoken questions with speech-synchronized avatar animations.
- **Contextual Probing Follow-Ups:** Automatically detects when candidates reference projects, databases, or team situations and generates relevant follow-ups.
- **5-Dimensional Scorecard:** Evaluates *Communication*, *Technical Accuracy*, *Relevance*, *Clarity*, and *Confidence / Completeness*.
- **Question-by-Question Breakdown:** Expandable review cards identifying specific strong points and improvement areas for each question.
- **Validation Feedback Loop:** Real candidate rating modal directly capturing usefulness and realism feedback.
- **Internal Metrics & Funnel Dashboard:** Accessible at `/analytics` to inspect real user completion rates and feedback logs without third-party dependencies.

---

## 7. Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components & Route Handlers)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS + custom glassmorphic tokens + CSS animations
- **Icons:** Lucide React
- **AI Service:** Google Gemini 1.5 Flash API (with automated deterministic mock fallback for offline reliability)
- **Voice UX:** Browser Web Speech API (`SpeechSynthesis` & `SpeechRecognition`)
- **State & Session Persistence:** Client `localStorage` state machine + Serverless API handlers
- **Deployment Target:** Vercel (Edge/Serverless ready)

---

## 8. Architecture

```
├── app/
│   ├── layout.tsx                # Root layout, theme provider & typography
│   ├── page.tsx                  # Landing page with hero, problem breakdown & avatar demo
│   ├── globals.css               # Design system variables, glassmorphism & visualizers
│   ├── analytics/page.tsx        # Internal live traction & validation feedback dashboard
│   ├── interview/
│   │   ├── setup/page.tsx        # Role, difficulty, style & length configuration
│   │   ├── session/page.tsx      # Main interview stage: Avatar, question card & voice STT
│   │   └── results/page.tsx      # Scorecard, question breakdown & validation feedback
│   └── api/
│       ├── interview/generate/   # Structured question generation endpoint
│       ├── evaluate/             # Answer evaluation & scorecard synthesis endpoint
│       └── feedback/             # Real-user validation data storage endpoint
│
├── components/
│   ├── avatar/
│   │   ├── AIAvatar.tsx          # Central animated AI Avatar component
│   │   ├── AvatarAudioVisualizer.tsx # Dynamic SVG waveform audio visualizer
│   │   └── AvatarStatusIndicator.tsx # Real-time state badge (Idle/Listening/Thinking/Speaking)
│   ├── dashboard/
│   │   ├── ScoreCard.tsx         # Overall score (1-100) & 5-dimension progress cards
│   │   └── RecommendationList.tsx # Strengths, areas to improve & suggested next steps
│   ├── interview/
│   │   ├── AnswerInput.tsx       # Microphone speech-to-text + editable transcript input
│   │   ├── FeedbackModal.tsx     # Real user validation modal (Traction & NPS)
│   │   ├── InterviewHeader.tsx   # Progress counter, role tags & quit confirmation
│   │   └── QuestionCard.tsx      # Question display, category badge & audio replay
│   └── ui/                       # Reusable Button, Card, Badge, Progress components
│
├── lib/
│   ├── ai/
│   │   ├── gemini.ts             # Google Gemini Flash structured API client
│   │   ├── mock.ts               # Offline fallback deterministic AI service
│   │   ├── prompts.ts            # Structured JSON prompt engineering templates
│   │   ├── service.ts            # Unified AI service provider factory
│   │   └── types.ts              # AI request/response contracts
│   ├── analytics/
│   │   └── tracker.ts            # Telemetry tracker & funnel statistics
│   ├── interview/
│   │   └── session-manager.ts    # Session lifecycle & state preservation
│   └── utils/
│       ├── cn.ts                 # Tailwind class merger
│       └── speech.ts             # Browser Speech API wrapper
│
└── types/
    ├── analytics.ts              # Telemetry events & validation feedback models
    ├── avatar.ts                 # Avatar state, styles & emotion types
    └── interview.ts              # Core domain interfaces
```

---

## 9. AI Approach & Prompt Architecture

1. **System Prompt Persona:** The model acts as a rigorous yet encouraging Senior Interviewer, evaluating actual answers against industry rubrics rather than checking against a rigid single answer.
2. **Structured JSON Output:** All AI generations adhere to strict TypeScript JSON schemas, eliminating hallucinations and markdown formatting issues.
3. **Dynamic Probing Prompts:** The evaluation prompt evaluates prior turns and determines whether a candidate's answer introduces a specific architecture or trade-off that warrants an immediate follow-up.
4. **Evidence-Based Feedback:** The scorecard prompt references concrete phrases from candidate answers in the executive summary, strengths, and areas for improvement.
5. **Zero-Downtime Fallback:** If the `AI_API_KEY` is missing or the external network drops, the application automatically switches to a deterministic role-tailored mock engine so users are never blocked.

---

## 10. Analytics & Telemetry

InterviewAI tracks critical behavioral events without collecting sensitive personal data:
- `landing_view`: User lands on the homepage.
- `setup_started`: User enters the interview configuration screen.
- `interview_started`: Mock interview is initialized.
- `question_answered`: Answer submitted (records duration, mode: voice/text, word count).
- `interview_completed`: Candidate reaches the end of the session.
- `results_viewed`: Candidate inspects the scorecard and feedback.
- `feedback_submitted`: Candidate submits validation responses.
- `retry_clicked`: Candidate starts another mock interview.

Conversion metrics and drop-off rates are viewable in real time at `/analytics`.

---

## 11. Validation & Feedback Collection

To validate the product with real users without manufacturing fake traction, InterviewAI embeds a structured validation mechanism at the end of every interview:
1. *Was this mock interview useful?* (👍 Yes / 👎 No)
2. *How realistic did the AI avatar conversation feel?* (1–5 scale)
3. *Would you use InterviewAI again to practice?* (Yes / Maybe / No)
4. *Was anything confusing or unnatural?* (Qualitative feedback)
5. *What should we improve for the next release?* (Feature requests)

---

## 12. Local Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd InterviewAI

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local testing)
cp .env.example .env.local

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

---

## 13. Environment Variables

Create `.env.local` using `.env.example`:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Google Gemini API Key
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```

> **Note:** If `AI_API_KEY` is omitted or set to placeholder, InterviewAI automatically activates the built-in deterministic mock AI engine, ensuring full offline operability.

---

## 14. Vercel Deployment

1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import Git Repository"**.
3. Framework Preset: **Next.js**.
4. Set Environment Variables (optional: `AI_API_KEY`).
5. Click **"Deploy"**.
6. The app will be live on your `.vercel.app` domain.

---

## 15. Known Limitations

- **Speech Recognition Browser Support:** Native Web Speech API is fully supported in Chromium browsers (Chrome, Edge, Brave) and Safari, but has limited support in Firefox. In unsupported browsers, InterviewAI automatically defaults to text input.
- **Audio Autoplay Policies:** Some browsers require an initial user click before allowing speech synthesis audio playback.
- **In-Memory Feedback Storage:** Serverless function feedback storage resets on redeployment unless connected to a persistent PostgreSQL/Supabase database via `DATABASE_URL`.

---

## 16. Future Improvements (Post-MVP Roadmap)

- **Photorealistic Video Avatar Stream:** Integrate streaming video avatar SDKs (e.g. Simli, HeyGen, or LiveKit) for real-time lip-synced video.
- **Live Coding Canvas:** Add a split-screen code editor for coding interviews with real-time test execution.
- **Resume-Based Personalization:** Allow candidates to upload their PDF resume so the AI avatar tailors questions directly to their past work experience.
- **Speech Filler-Word Detection:** Analyze audio for speech disfluencies (e.g., "um", "like", "you know") and speech pacing (words per minute).

---

## 17. Tools & Services Used

In accordance with assignment guidelines, the following tools were utilized in building InterviewAI:
- **Google Gemini 1.5 Flash:** LLM reasoning engine for structured question generation, dynamic follow-up logic, and scorecard synthesis.
- **Next.js & React:** Modern web application framework.
- **Tailwind CSS & Lucide Icons:** User interface styling and icon system.
- **Web Speech API:** Browser-native SpeechSynthesis and SpeechRecognition APIs.
