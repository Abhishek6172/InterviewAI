import { GenerateQuestionsRequest, EvaluateAnswerRequest, GenerateScorecardRequest } from "./types";

export const INTERVIEWER_SYSTEM_PROMPT = `
You are Sara, an expert, professional, and discerning Senior AI Technical Interviewer at a top technology firm.
Your goal is to conduct a highly realistic, customized, and non-repetitive job interview tailored specifically to the candidate's target role, experience level, and resume background.

Core Operating Rules:
1. ALWAYS stay in character as Sara, the interviewer. Keep questions natural, crisp, conversational, and direct.
2. IF A RESUME IS PROVIDED:
   - You MUST thoroughly scan their listed projects, work experience, technologies, and achievements.
   - You MUST explicitly name their actual projects (e.g. "I noticed your project [Project Name]...") and probe their specific architecture, trade-offs, and tech stack.
   - Never ask generic questions when resume projects and technologies are available.
3. PREVENT REPETITION:
   - Each question MUST cover a completely different angle:
     * Question 1: Introduction & Architecture Deep-Dive into their primary listed project / work.
     * Question 2: Technical deep-dive into specific tools, state management, databases, or API design used in their project.
     * Question 3: Critical debugging, edge-cases, concurrency, or performance bottleneck they solved.
     * Question 4: Behavioral STAR question regarding technical conflict, tight deadlines, or ambiguity during that project.
     * Question 5+: System scalability, security, testing strategy, or failure recovery for their systems.
4. Return strictly valid JSON conforming to the requested schema with no surrounding text or markdown preamble.
`;

export function createQuestionsPrompt(req: GenerateQuestionsRequest): string {
  const hasResume = req.resumeText && req.resumeText.trim().length > 20;

  const resumeSection = hasResume
    ? `=== CANDIDATE RESUME & PROJECT PORTFOLIO (CRITICAL - YOU MUST USE THIS) ===\n${req.resumeText!.slice(0, 4500)}\n========================================================================\n
INSTRUCTIONS FOR RESUME-BASED QUESTIONS:
- Extract 2-3 specific project names, tools, languages, and frameworks from the resume above.
- Question 1 MUST explicitly cite their main project by name and ask them to walk through the system architecture and their specific contributions.
- Question 2 MUST ask a deep technical question about a specific technology, library, or database mentioned in their projects.
- Question 3 MUST probe a real-world edge case, latency optimization, or debugging incident related to their tech stack.
- Question 4 MUST be a behavioral question (STAR method) about collaboration or shifting priorities during their project work.`
    : `No resume provided. Generate a diverse, non-repeating set of ${req.count} questions tailored for a ${req.difficulty} level ${req.role} candidate covering introductory architecture, technical depth, problem-solving, behavioral teamwork, and system reliability.`;

  return `
Conduct a "${req.role}" interview (${req.difficulty} difficulty, ${req.experienceLevel} level, style: ${req.interviewType}) with ${req.count} questions.

${resumeSection}

JSON Output Schema:
{
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "question": "Clear, realistic interview question (explicitly naming candidate's project if resume was provided).",
      "category": "introductory" | "technical" | "behavioral" | "problem-solving" | "system-design",
      "difficulty": "${req.difficulty}",
      "contextHint": "1-sentence hint for the candidate",
      "expectedTopics": ["Key Topic 1", "Key Topic 2"]
    }
  ]
}

Ensure questions are 100% unique, non-repetitive, and directly relevant to ${req.role}.
Return ONLY valid JSON.
`;
}

export function createEvaluationPrompt(req: EvaluateAnswerRequest): string {
  const historySnippet =
    req.conversationHistory && req.conversationHistory.length > 0
      ? `Prior Questions in Session:\n${req.conversationHistory.slice(-2).map((h) => `Q: ${h.questionText}\nA: ${h.userAnswer}`).join("\n")}\n`
      : "";

  const isUnknownAnswer =
    /^(i don'?t know|no idea|i am not sure|idk|pass|don'?t know|nothing|na|none|skip)\.?$/i.test(req.userAnswer.trim());

  return `
You are evaluating a candidate's answer in a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

${historySnippet}
Current Question (${req.question.category}):
"${req.question.question}"

Candidate's Actual Answer:
"${req.userAnswer}"

Evaluation Rules:
1. Rate their response objectively on a 1.0-10.0 scale:
   ${
     isUnknownAnswer
       ? "NOTE: The candidate answered 'I don't know' or skipped. Score them 1.0-2.5/10 across technical and clarity metrics and provide advice on how candidates should reason aloud through unknown topics during technical interviews."
       : "Evaluate based on technical correctness, depth, STAR structure, trade-offs, and clarity."
   }
   - Communication (Articulation, pacing, structure)
   - Technical Accuracy (Domain correctness, depth, trade-off understanding)
   - Relevance (Directly answered the question without unnecessary fluff)
   - Clarity (Understandable explanations, well-organized thoughts)
   - Confidence / Completeness (Covered edge cases, constraints, impact)
2. Identify 2-3 specific things observed in their response ("whatWasGood").
3. Identify 2-3 actionable areas they could improve ("whatCouldImprove").
4. If candidate provided an interesting answer mentioning a project and ${req.canFollowUp ? "true" : "false"} is true, provide a contextual follow-up question.

Output strictly valid JSON matching this schema:
{
  "evaluation": {
    "questionId": "${req.question.id}",
    "score": ${isUnknownAnswer ? 2.0 : 7.5},
    "communicationScore": ${isUnknownAnswer ? 3.0 : 8.0},
    "technicalScore": ${isUnknownAnswer ? 1.0 : 7.5},
    "relevanceScore": ${isUnknownAnswer ? 2.0 : 8.0},
    "clarityScore": ${isUnknownAnswer ? 3.0 : 8.0},
    "confidenceScore": ${isUnknownAnswer ? 2.0 : 7.0},
    "feedback": "2-3 constructive sentences referencing the candidate's actual points.",
    "whatWasGood": ["Observation 1", "Observation 2"],
    "whatCouldImprove": ["Constructive tip 1", "Constructive tip 2"],
    "shouldFollowUp": false,
    "followUpQuestionText": "Optional follow-up question text if applicable"
  }
}
Return ONLY valid JSON.
`;
}

export function createScorecardPrompt(req: GenerateScorecardRequest): string {
  const conversationSummary = req.questions
    .map(
      (q, idx) => `
Q${idx + 1} (${q.category}): ${q.question}
Candidate's Answer: ${req.answers[q.id]?.answerText || "No answer provided"}
Scores: Communication: ${req.evaluations[q.id]?.communicationScore || 5}, Technical: ${req.evaluations[q.id]?.technicalScore || 5}, Relevance: ${req.evaluations[q.id]?.relevanceScore || 5}
Evaluation: ${req.evaluations[q.id]?.feedback || "N/A"}
What was good: ${(req.evaluations[q.id]?.whatWasGood || []).join("; ")}
What could improve: ${(req.evaluations[q.id]?.whatCouldImprove || []).join("; ")}
`
    )
    .join("\n");

  const resumeContext = req.resumeText ? `Candidate Resume Context:\n${req.resumeText.slice(0, 2000)}\n` : "";

  return `
Generate a comprehensive, evidence-based final interview scorecard for a candidate who completed a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

${resumeContext}
Interview Transcript & Evaluations:
${conversationSummary}

Guidelines:
1. Calculate overall score (1-100) and dimensional averages (1-10) objectively from their actual answers. If candidate answered "I don't know" or skipped most questions, the score should accurately reflect that (e.g. 15-35 / 100).
2. Executive Summary: 3-4 professional sentences summarizing overall interview readiness, citing specific aspects of their answers.
3. Strengths: 3 to 5 concise points citing actual examples from the session.
4. Areas to Improve: 3 to 5 actionable points directly addressing weaknesses noticed in their answers.
5. Suggested Next Steps: 3 concrete recommendations (e.g. specific topics or STAR frameworks to study).

Output strictly valid JSON matching this schema:
{
  "scorecard": {
    "sessionId": "session-scorecard",
    "overallScore": 75,
    "communicationScore": 7.5,
    "technicalScore": 7.0,
    "relevanceScore": 7.5,
    "clarityScore": 7.0,
    "confidenceScore": 7.0,
    "executiveSummary": "Summary of candidate performance...",
    "strengths": [
      "Strength 1",
      "Strength 2",
      "Strength 3"
    ],
    "areasToImprove": [
      "Improvement 1",
      "Improvement 2",
      "Improvement 3"
    ],
    "suggestedNextSteps": [
      "Next Step 1",
      "Next Step 2",
      "Next Step 3"
    ],
    "completedAt": "${new Date().toISOString()}"
  }
}
Return ONLY valid JSON.
`;
}
