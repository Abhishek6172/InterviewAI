import { GenerateQuestionsRequest, EvaluateAnswerRequest, GenerateScorecardRequest } from "./types";

export const INTERVIEWER_SYSTEM_PROMPT = `
You are an expert, professional, and empathetic Senior Interviewer conducting a realistic job interview.
You speak directly, stay focused on the candidate's target role, adapt to their seniority and resume background, and probe for real engineering/domain depth.

Core Operating Principles:
1. Always remain in character as an interviewer.
2. Ask clear, concise, and realistic interview questions tailored to the candidate's target role and resume context.
3. NEVER answer the question for the candidate or give away the solution while interviewing.
4. Evaluate what the candidate ACTUALLY stated:
   - If the candidate answers "I don't know", "no idea", or gives an empty/irrelevant response, score 0.0-2.5/10 and provide direct feedback on how they should have approached the unknown question.
   - If the candidate demonstrates depth, trade-offs, and metrics, score 8.0-10.0/10.
5. If the candidate mentions a specific project or architecture, ask a natural, probing follow-up.
6. Return strictly valid JSON matching the specified schemas.
`;

export function createQuestionsPrompt(req: GenerateQuestionsRequest): string {
  const historySnippet =
    req.conversationHistory && req.conversationHistory.length > 0
      ? `Previous Conversation Context:\n${req.conversationHistory.map((h) => `Q: ${h.questionText}\nA: ${h.userAnswer}`).join("\n")}`
      : "No previous questions.";

  const resumeSection = req.resumeText && req.resumeText.trim().length > 0
    ? `CANDIDATE'S RESUME & BACKGROUND:\n"""\n${req.resumeText.slice(0, 3000)}\n"""\n\nCRITICAL REQUIREMENT: Since the candidate provided their resume, tailor at least 2-3 questions directly to specific projects, technologies, internships, or achievements mentioned in their resume, while covering essential domain topics for a ${req.role}.`
    : "No resume provided.";

  return `
Create a realistic interview plan with ${req.count} questions for a "${req.role}" interview.
- Candidate Experience Level: ${req.experienceLevel}
- Difficulty: ${req.difficulty}
- Interview Style: ${req.interviewType}

${resumeSection}

${historySnippet}

Guidelines:
1. Ensure questions logically progress:
   - Question 1: If resume is provided, ask a targeted introductory question about their highlighted project or background. Otherwise, ask a foundational ${req.role} question.
   - Middle questions: In-depth technical probing, scenario problem-solving, or behavioral situation (STAR method).
   - Final questions: High-impact practical challenge or system/product trade-offs.
2. Output strictly valid JSON matching this schema:
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
  const historySnippet =
    req.conversationHistory && req.conversationHistory.length > 0
      ? `Prior Context:\n${req.conversationHistory.slice(-2).map((h) => `Q: ${h.questionText}\nA: ${h.userAnswer}`).join("\n")}\n`
      : "";

  const isUnknownAnswer =
    /^(i don'?t know|no idea|i am not sure|idk|pass|don'?t know|nothing|na|none)\.?$/i.test(req.userAnswer.trim());

  return `
You are evaluating a candidate's answer in a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

${historySnippet}
Current Question (${req.question.category}):
"${req.question.question}"

Candidate's Actual Answer:
"${req.userAnswer}"

Evaluation Rules:
1. Rate their ACTUAL response objectively across 5 dimensions on a 1.0-10.0 scale:
   ${
     isUnknownAnswer
       ? "NOTE: The candidate answered they do not know the answer. Score them appropriately low (1.0 - 2.5 / 10) across technical and clarity metrics, and give advice on how candidates should handle unknown topics during interviews (e.g. asking clarifying questions or mentioning related concepts)."
       : "Evaluate based on technical accuracy, STAR structure, clarity, and trade-off awareness."
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

  const resumeContext = req.resumeText ? `Candidate Resume Context:\n${req.resumeText.slice(0, 1500)}\n` : "";

  return `
Generate a comprehensive, evidence-based final interview scorecard for a candidate who completed a "${req.role}" (${req.difficulty} difficulty, ${req.experienceLevel} level) interview.

${resumeContext}
Interview Transcript & Evaluations:
${conversationSummary}

Guidelines:
1. Calculate overall score (1-100) and dimensional averages (1-10) objectively from their actual answers. If candidate answered "I don't know" to most questions, the overall score should accurately reflect that (e.g. 15-35 / 100).
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
