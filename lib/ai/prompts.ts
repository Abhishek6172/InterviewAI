import { GenerateQuestionsRequest, EvaluateAnswerRequest, GenerateScorecardRequest } from "./types";

export const INTERVIEWER_SYSTEM_PROMPT = `
You are an expert, professional, and empathetic Senior Interviewer conducting a realistic job interview.
You speak directly, stay focused on the candidate's target role, adapt to their seniority, and probe for real engineering / domain depth.

Core Operating Principles:
1. Always remain in character as an interviewer.
2. Ask clear, concise, and realistic interview questions.
3. NEVER answer the question for the candidate or give away the solution while interviewing.
4. Provide structured, evidence-based evaluations based on what the candidate actually said.
5. If the candidate gives an interesting project or partial answer, ask a natural, probing follow-up (e.g. "What was the hardest technical challenge you faced while building it?").
6. Always return clean, strictly valid JSON adhering to the specified schema. No preamble, no markdown wrappers unless requested.
`;

export function createQuestionsPrompt(req: GenerateQuestionsRequest): string {
  const historySnippet = req.conversationHistory && req.conversationHistory.length > 0
    ? `Previous Conversation Context:\n${req.conversationHistory.map((h, i) => `Q: ${h.questionText}\nA: ${h.userAnswer}`).join("\n")}`
    : "No previous questions.";

  return `
Create a realistic interview plan with ${req.count} questions for a "${req.role}" interview.
- Candidate Experience Level: ${req.experienceLevel}
- Difficulty: ${req.difficulty}
- Interview Style: ${req.interviewType}

${historySnippet}

Guidelines:
1. Ensure questions logically progress:
   - Question 1: Natural introductory/foundational question tailored to ${req.role} and ${req.experienceLevel}.
   - Middle questions: Core technical depth, scenario problem-solving, or behavioral situation (STAR method).
   - Final questions: High-impact practical challenge or system/product trade-offs.
2. Ensure questions are crisp, realistic, and do not repeat any past questions.
3. Output strictly valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "question": "Concise, realistic interview question.",
      "category": "introductory" | "technical" | "behavioral" | "problem-solving" | "system-design",
      "difficulty": "${req.difficulty}",
      "contextHint": "1-sentence hint of what an interviewer looks for",
      "expectedTopics": ["topic1", "topic2"]
    }
  ]
}
Return ONLY valid JSON.
`;
}

export function createEvaluationPrompt(req: EvaluateAnswerRequest): string {
  const historySnippet = req.conversationHistory && req.conversationHistory.length > 0
    ? `Prior Context:\n${req.conversationHistory.slice(-2).map((h) => `Q: ${h.questionText}\nA: ${h.userAnswer}`).join("\n")}\n`
    : "";

  return `
You are evaluating a candidate's answer in a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

${historySnippet}
Current Question (${req.question.category}):
"${req.question.question}"

Candidate's Answer:
"${req.userAnswer}"

Evaluation Rules:
1. Evaluate their ACTUAL response objectively across 5 dimensions on a 1-10 scale:
   - Communication (Articulation, pacing, structure)
   - Technical Accuracy (Domain correctness, depth, trade-off understanding)
   - Relevance (Directly answered the question without unnecessary fluff)
   - Clarity (Understandable explanations, well-organized thoughts)
   - Confidence / Completeness (Covered edge cases, constraints, impact)
2. Identify 2-3 specific things they did well ("whatWasGood").
3. Identify 2-3 specific areas they could improve ("whatCouldImprove").
4. If the candidate mentioned a specific project, technology, or trade-off that warrants a natural interviewer follow-up, and ${req.canFollowUp ? "true" : "false"} is true, provide a contextual follow-up question.

Output strictly valid JSON matching this schema:
{
  "evaluation": {
    "questionId": "${req.question.id}",
    "score": 7.5,
    "communicationScore": 8.0,
    "technicalScore": 7.5,
    "relevanceScore": 8.0,
    "clarityScore": 8.0,
    "confidenceScore": 7.0,
    "feedback": "2-3 constructive sentences referencing the candidate's actual points.",
    "whatWasGood": ["Specific strong point from answer", "Second good observation"],
    "whatCouldImprove": ["Specific constructive suggestion", "Second actionable improvement"],
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
Scores: Communication: ${req.evaluations[q.id]?.communicationScore || 7}, Technical: ${req.evaluations[q.id]?.technicalScore || 7}, Relevance: ${req.evaluations[q.id]?.relevanceScore || 7}
Evaluation: ${req.evaluations[q.id]?.feedback || "N/A"}
What was good: ${(req.evaluations[q.id]?.whatWasGood || []).join("; ")}
What could improve: ${(req.evaluations[q.id]?.whatCouldImprove || []).join("; ")}
`
    )
    .join("\n");

  return `
Generate a comprehensive, evidence-based final interview scorecard for a candidate who completed a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

Interview Transcript & Evaluations:
${conversationSummary}

Guidelines:
1. Calculate overall score (1-100) and dimensional averages (1-10) objectively from their answers.
2. Executive Summary: 3-4 professional sentences summarizing overall interview readiness, citing specific aspects of their answers.
3. Strengths: 3 to 5 concise points citing actual examples from the session.
4. Areas to Improve: 3 to 5 actionable points directly addressing weaknesses noticed in their answers.
5. Suggested Next Steps: 3 concrete recommendations (e.g., "Practice explaining projects in 90 seconds", "Review REST API fundamentals", "Give more measurable impact in behavioral answers").

Output strictly valid JSON matching this schema:
{
  "scorecard": {
    "sessionId": "session-scorecard",
    "overallScore": 84,
    "communicationScore": 8.5,
    "technicalScore": 8.0,
    "relevanceScore": 8.5,
    "clarityScore": 8.0,
    "confidenceScore": 8.0,
    "executiveSummary": "Strong demonstration of technical knowledge and structured communication...",
    "strengths": [
      "Clearly articulated architectural choices when discussing system design",
      "Used the STAR method effectively during the behavioral scenario",
      "Demonstrated good awareness of caching and query bottlenecks"
    ],
    "areasToImprove": [
      "Include more quantitative metrics and KPIs when discussing past project impact",
      "Provide more depth on failure modes and database rollback strategies",
      "Keep introductory answers under 90 seconds to avoid unnecessary background details"
    ],
    "suggestedNextSteps": [
      "Practice explaining project architecture in under 90 seconds using whiteboard diagrams",
      "Review distributed caching patterns (Redis, write-through vs cache-aside)",
      "Prepare 3 concrete STAR stories highlighting measurable business impact"
    ],
    "completedAt": "${new Date().toISOString()}"
  }
}
Return ONLY valid JSON.
`;
}
