import { GenerateQuestionsRequest, EvaluateAnswerRequest, GenerateScorecardRequest } from "./types";

export const INTERVIEWER_SYSTEM_PROMPT = `
You are Sara, an expert, professional, and discerning Senior AI Interviewer.
You conduct realistic, domain-accurate, and non-repetitive job interviews for ANY profession or career path chosen by the candidate — including Advocates/Lawyers, Doctors/Healthcare, Software Engineers, Financial Analysts/Accountants, Product Managers, Civil/Mechanical Engineers, Marketing Executives, Educators, and any custom field.

Core Interviewing Rules:
1. ALWAYS stay in character as Sara. Keep questions crisp, authoritative, conversational, and direct.
2. ADAPT TO THE CANDIDATE'S SPECIFIC PROFESSION:
   - For an Advocate/Lawyer: Ask about legal precedent, statutory interpretation, litigation strategy, contract drafting, cross-examination, regulatory compliance, and court jurisdiction.
   - For a Doctor/Healthcare Professional: Ask about clinical diagnosis, treatment protocols, patient emergency triage, and medical ethics.
   - For Finance/Accounting: Ask about financial modeling, GAAP/IFRS audits, tax strategy, risk mitigation, and cash flow forecasting.
   - For Engineering/Tech: Ask about system architecture, performance bottlenecks, tech stacks, and scalability.
   - For any other custom career: Ask about domain-specific best practices, stakeholder negotiation, and crisis resolution.
3. IF A RESUME IS PROVIDED:
   - You MUST thoroughly scan their listed cases, projects, internships, firms, clients, technologies, or achievements.
   - You MUST explicitly cite their actual work, case matters, or projects by name (e.g. "I see on your resume that you handled [Case/Project Name] regarding [Domain/Subject]...").
   - Never ask generic questions when candidate-specific resume details are available.
4. PREVENT REPETITION:
   - Question 1: Introduction & walkthrough of a major case, project, or professional engagement from their resume.
   - Question 2: Technical / Domain depth probing into specific statutes, frameworks, tools, or methodologies used.
   - Question 3: Complex problem-solving, high-stakes dispute, unexpected crisis, or edge-case handling.
   - Question 4: Professional ethics, client/stakeholder conflict, or deadline management (STAR method).
   - Question 5+: Strategic planning, regulatory evolution, or scaling domain impact.
5. Return strictly valid JSON conforming to the requested schema.
`;

export function createQuestionsPrompt(req: GenerateQuestionsRequest): string {
  const hasResume = req.resumeText && req.resumeText.trim().length > 20;

  const resumeSection = hasResume
    ? `=== CANDIDATE RESUME & PROFESSIONAL PORTFOLIO (CRITICAL - YOU MUST USE THIS) ===\n${req.resumeText!.slice(0, 4500)}\n========================================================================\n
INSTRUCTIONS FOR RESUME-BASED QUESTIONS:
- Extract 2-3 specific case names, client engagements, projects, tools, statutes, or accomplishments from the resume above.
- Question 1 MUST explicitly cite their main case, project, or firm experience by name and ask them to walk through their strategy, methodology, and direct contributions.
- Question 2 MUST ask a deep domain question about a specific legal statute, tool, methodology, or framework mentioned in their experience.
- Question 3 MUST probe a real-world dispute, unexpected crisis, procedural obstacle, or edge-case resolution.
- Question 4 MUST be a behavioral question (STAR method) about client management, high-stakes negotiations, or ethical dilemmas.`
    : `No resume provided. Generate a diverse, non-repeating set of ${req.count} questions tailored for a ${req.difficulty} level ${req.role} candidate covering professional background, deep domain technicalities, crisis problem-solving, behavioral ethics/teamwork, and strategic industry foresight.`;

  return `
Conduct a "${req.role}" interview (${req.difficulty} difficulty, ${req.experienceLevel} level, style: ${req.interviewType}) with ${req.count} questions.

${resumeSection}

JSON Output Schema:
{
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "question": "Realistic, profession-accurate interview question (explicitly naming candidate's case/project if resume was provided).",
      "category": "introductory" | "technical" | "behavioral" | "problem-solving" | "system-design",
      "difficulty": "${req.difficulty}",
      "contextHint": "1-sentence hint for the candidate",
      "expectedTopics": ["Topic 1", "Topic 2"]
    }
  ]
}

Ensure all questions strictly match the terminology, standards, and practical demands of "${req.role}".
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
1. Rate their response objectively on a 1.0-10.0 scale according to the professional standards of ${req.role}:
   ${
     isUnknownAnswer
       ? "NOTE: The candidate answered 'I don't know' or skipped. Score them 1.0-2.5/10 across domain knowledge and clarity metrics, and provide advice on how candidates in this field should reason through unfamiliar scenarios."
       : "Evaluate based on domain accuracy, STAR structure, practical depth, ethical grounding, and clarity."
   }
   - Communication (Articulation, pacing, professional demeanor)
   - Technical / Domain Accuracy (Correctness of legal, technical, medical, or financial principles)
   - Relevance (Directly answered the question without unnecessary fluff)
   - Clarity (Understandable explanations, well-organized thoughts)
   - Confidence / Completeness (Covered edge cases, precedents, constraints, impact)
2. Identify 2-3 specific things observed in their response ("whatWasGood").
3. Identify 2-3 actionable areas they could improve ("whatCouldImprove").
4. If candidate provided an interesting answer mentioning a project or case and ${req.canFollowUp ? "true" : "false"} is true, provide a contextual follow-up question.

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
Scores: Communication: ${req.evaluations[q.id]?.communicationScore || 5}, Domain/Technical: ${req.evaluations[q.id]?.technicalScore || 5}, Relevance: ${req.evaluations[q.id]?.relevanceScore || 5}
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
2. Executive Summary: 3-4 professional sentences summarizing overall interview readiness for ${req.role}, citing specific aspects of their answers.
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
