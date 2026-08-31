import {
  AIService,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  EvaluateAnswerRequest,
  EvaluateAnswerResponse,
  GenerateScorecardRequest,
  GenerateScorecardResponse,
} from "./types";
import { InterviewQuestion } from "@/types/interview";

export class MockAIService implements AIService {
  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    await new Promise((r) => setTimeout(r, 350));

    const role = req.role.toLowerCase();
    const hasResume = Boolean(req.resumeText && req.resumeText.trim().length > 0);

    let questionBank: InterviewQuestion[] = [];

    if (hasResume) {
      // Resume-aware questions
      questionBank = [
        {
          id: `q_res_${Date.now()}_1`,
          order: 1,
          question: `I reviewed your resume for ${req.role}. Can you introduce yourself and walk me through the architecture and your key technical contributions to your primary project listed on your resume?`,
          category: "introductory",
          difficulty: req.difficulty,
          contextHint: "Detail your specific role, technical stack, architecture decisions, and business impact.",
          expectedTopics: ["Project Architecture", "Technical Stack", "Ownership", "Key Metrics"],
        },
        {
          id: `q_res_${Date.now()}_2`,
          order: 2,
          question: `Looking at your project experience, what was the most difficult technical challenge or performance bottleneck you encountered, and how did you debug and resolve it?`,
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Explain your diagnosis methodology, alternative solutions evaluated, and the final implementation.",
          expectedTopics: ["Root Cause Analysis", "Debugging", "Optimization", "Trade-offs"],
        },
        {
          id: `q_res_${Date.now()}_3`,
          order: 3,
          question: `Tell me about a time you had to adapt to changing project requirements or handle a technical disagreement with a team member while building these systems.`,
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Use the STAR method: Situation, Task, Action, Result.",
          expectedTopics: ["Collaboration", "Conflict Resolution", "STAR method"],
        },
        {
          id: `q_res_${Date.now()}_4`,
          order: 4,
          question: `How did you approach automated testing, continuous integration, and edge-case validation for your applications before shipping them?`,
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Discuss unit vs integration tests, mocking, CI pipelines, and error handling.",
          expectedTopics: ["Testing Strategy", "CI/CD", "Reliability"],
        },
        {
          id: `q_res_${Date.now()}_5`,
          order: 5,
          question: `If traffic to your application increased by 10x overnight, what parts of your architecture would fail first and how would you scale them?`,
          category: "system-design",
          difficulty: req.difficulty,
          contextHint: "Identify bottlenecks: database connections, caching, load balancing, or asynchronous processing.",
          expectedTopics: ["Scaling", "Caching", "Database Bottlenecks", "Asynchronous Workers"],
        },
      ];
    } else if (role.includes("frontend") || role.includes("ui") || role.includes("react")) {
      questionBank = [
        {
          id: `q_fe_${Date.now()}_1`,
          order: 1,
          question: "Can you walk me through a challenging frontend feature you built, focusing on how you managed state and optimized rendering performance?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Highlight state libraries, reconciliation, memoization, and bundle size.",
          expectedTopics: ["State Management", "Virtual DOM", "React.memo/useMemo", "Core Web Vitals"],
        },
        {
          id: `q_fe_${Date.now()}_2`,
          order: 2,
          question: "How do you handle API error boundaries, loading skeletons, and offline fallback states to ensure a seamless user experience?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss optimistic updates, error boundaries, React Suspense, and network retry logic.",
          expectedTopics: ["Error Boundaries", "Optimistic UI", "Async handling"],
        },
        {
          id: `q_fe_${Date.now()}_3`,
          order: 3,
          question: "Describe a time when you received ambiguous design mockups or shifting requirements close to a deadline. How did you handle it?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Use the STAR method: Situation, Task, Action, Result with focus on proactive alignment.",
          expectedTopics: ["Communication", "Stakeholder management", "STAR method"],
        },
      ];
    } else {
      // General Software Engineer
      questionBank = [
        {
          id: `q_gen_${Date.now()}_1`,
          order: 1,
          question: `Can you introduce your background in ${req.role} and explain the technical architecture of a recent project you built?`,
          category: "introductory",
          difficulty: req.difficulty,
          contextHint: "Give a crisp overview covering technical stack, your specific ownership, and key results.",
          expectedTopics: ["Project Overview", "Ownership", "Technical Stack"],
        },
        {
          id: `q_gen_${Date.now()}_2`,
          order: 2,
          question: `What are the most important design trade-offs you consider when architecting systems for ${req.role}?`,
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss performance, maintainability, scalability, and testability.",
          expectedTopics: ["Design Trade-offs", "Scalability", "Maintainability"],
        },
        {
          id: `q_gen_${Date.now()}_3`,
          order: 3,
          question: "Tell me about a critical bug or production incident you investigated. What was the root cause and how did you resolve it?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Use the STAR method: Situation, Task, Action, Result with post-mortem learnings.",
          expectedTopics: ["Debugging", "Incident Management", "STAR method"],
        },
      ];
    }

    let selected = [...questionBank];
    while (selected.length < req.count) {
      const idx = selected.length + 1;
      selected.push({
        id: `q_extra_${Date.now()}_${idx}`,
        order: idx,
        question: `How do you approach debugging, monitoring, and telemetry when unexpected errors occur in production?`,
        category: "problem-solving",
        difficulty: req.difficulty,
        contextHint: "Mention telemetry, logging, metrics, and incident runbooks.",
      });
    }

    return {
      questions: selected.slice(0, req.count).map((q, i) => ({ ...q, order: i + 1 })),
    };
  }

  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    await new Promise((r) => setTimeout(r, 400));

    const text = req.userAnswer.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lower = text.toLowerCase();

    // Check for "I don't know" or zero-effort answers
    const isUnknown =
      /^(i don'?t know|no idea|i am not sure|idk|pass|don'?t know|nothing|na|none|skip)\.?$/i.test(text) ||
      wordCount < 4;

    if (isUnknown) {
      return {
        evaluation: {
          questionId: req.question.id,
          score: 1.5,
          communicationScore: 2.5,
          technicalScore: 1.0,
          relevanceScore: 1.5,
          clarityScore: 3.0,
          confidenceScore: 1.0,
          feedback: `You indicated that you do not know the answer ("${text || "No response"}"). In a real technical interview, giving an 'I don't know' response without demonstrating problem-solving attempts results in a failing score for that question. Even when uncertain, articulate what you do know, ask clarifying questions, or discuss related technologies.`,
          whatWasGood: ["Acknowledged knowledge boundary promptly"],
          whatCouldImprove: [
            "Never end with 'I don't know' — explain how you would investigate or debug the concept",
            "Discuss related tools, design patterns, or fundamental principles to demonstrate problem-solving intuition",
            "Ask clarifying questions to the interviewer to break down the problem into smaller parts",
          ],
          shouldFollowUp: false,
        },
      };
    }

    // Very short answers (< 15 words)
    if (wordCount < 15) {
      return {
        evaluation: {
          questionId: req.question.id,
          score: 4.2,
          communicationScore: 4.5,
          technicalScore: 4.0,
          relevanceScore: 5.0,
          clarityScore: 4.5,
          confidenceScore: 4.0,
          feedback: `Your response was only ${wordCount} words long. While directly on-topic, it was too brief to demonstrate technical depth or architectural trade-offs expected for a ${req.difficulty} ${req.role} interview.`,
          whatWasGood: ["Direct and concise response"],
          whatCouldImprove: [
            "Expand your answer with specific architecture components, technologies used, and real-world trade-offs",
            "Use the STAR method (Situation, Task, Action, Result) to provide concrete examples",
            "Mention measurable results or metrics from your experience",
          ],
          shouldFollowUp: false,
        },
      };
    }

    // Medium answers (15 - 55 words)
    if (wordCount < 55) {
      const hasTechTerms = /(api|database|react|cache|state|service|latency|scaling|sql|async|component|schema|git|ci\/cd|pipeline)/i.test(lower);
      const score = hasTechTerms ? 7.2 : 6.0;

      return {
        evaluation: {
          questionId: req.question.id,
          score,
          communicationScore: hasTechTerms ? 7.5 : 6.5,
          technicalScore: hasTechTerms ? 7.0 : 5.5,
          relevanceScore: 7.5,
          clarityScore: 7.0,
          confidenceScore: 6.8,
          feedback: `Solid answer explaining the core concept. To reach the top percentile, elaborate further on the trade-offs you evaluated and the specific metrics or constraints you operated under.`,
          whatWasGood: [
            "Good articulation of foundational concepts",
            "Clear logical progression in your explanation",
          ],
          whatCouldImprove: [
            "Include quantifiable impact (e.g. reduced latency by 30%, improved throughput)",
            "Explain alternative solutions you considered and why your chosen approach was superior",
          ],
          shouldFollowUp: false,
        },
      };
    }

    // In-depth answers (55+ words)
    return {
      evaluation: {
        questionId: req.question.id,
        score: 8.8,
        communicationScore: 9.0,
        technicalScore: 8.7,
        relevanceScore: 9.0,
        clarityScore: 8.8,
        confidenceScore: 8.7,
        feedback: `Excellent, comprehensive answer. You structured your explanation logically, incorporated concrete technical terminology, and demonstrated strong engineering depth.`,
        whatWasGood: [
          "Detailed technical depth with clear architectural context",
          "Demonstrated practical understanding of trade-offs and constraints",
          "Well-structured communication matching senior candidate standards",
        ],
        whatCouldImprove: [
          "Keep your delivery focused to ensure answers fit comfortably within a 2-minute window during rapid-fire rounds",
        ],
        shouldFollowUp: false,
      },
    };
  }

  async generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse> {
    await new Promise((r) => setTimeout(r, 450));

    const questions = req.questions || [];
    const evaluations = req.evaluations || {};
    const answers = req.answers || {};

    let totalComm = 0;
    let totalTech = 0;
    let totalRel = 0;
    let totalClar = 0;
    let totalConf = 0;
    let validCount = 0;
    let unknownCount = 0;

    for (const q of questions) {
      const ans = answers[q.id]?.answerText?.trim() || "";
      const isUnk =
        /^(i don'?t know|no idea|i am not sure|idk|pass|don'?t know|nothing|na|none)\.?$/i.test(ans) ||
        ans.split(/\s+/).filter(Boolean).length < 4;

      if (isUnk) {
        unknownCount++;
      }

      const ev = evaluations[q.id];
      if (ev) {
        totalComm += ev.communicationScore || 3.0;
        totalTech += ev.technicalScore || 1.5;
        totalRel += ev.relevanceScore || 2.0;
        totalClar += ev.clarityScore || 3.0;
        totalConf += ev.confidenceScore || 2.0;
        validCount++;
      } else if (isUnk) {
        totalComm += 2.5;
        totalTech += 1.0;
        totalRel += 1.5;
        totalClar += 3.0;
        totalConf += 1.0;
        validCount++;
      }
    }

    const divisor = Math.max(1, validCount);
    const commAvg = Number((totalComm / divisor).toFixed(1));
    const techAvg = Number((totalTech / divisor).toFixed(1));
    const relAvg = Number((totalRel / divisor).toFixed(1));
    const clarAvg = Number((totalClar / divisor).toFixed(1));
    const confAvg = Number((totalConf / divisor).toFixed(1));

    // Dynamic overall score calculation from 0 to 100
    const rawOverall = Math.round(((commAvg + techAvg + relAvg + clarAvg + confAvg) / 5) * 10);
    const overallScore = Math.min(100, Math.max(12, rawOverall));

    // Dynamic synthesis based on actual candidate score
    let executiveSummary = "";
    let strengths: string[] = [];
    let areasToImprove: string[] = [];
    let suggestedNextSteps: string[] = [];

    if (overallScore < 35 || unknownCount >= questions.length / 2) {
      executiveSummary = `Candidate answered 'I don't know' or gave minimal responses to ${unknownCount} out of ${questions.length} questions during the ${req.role} interview. To pass technical screenings, candidates must attempt to reason through unknown topics out loud, discuss relevant fundamentals, or ask clarifying questions rather than declining to answer.`;
      strengths = [
        "Transparent about immediate knowledge boundaries without guessing arbitrarily",
        "Completed the full sequence of interview questions",
      ];
      areasToImprove = [
        "Never answer 'I don't know' in isolation — articulate how you would debug or investigate the unknown problem",
        "Prepare core foundational concepts for your target role (data structures, system flow, architecture patterns)",
        "Use the STAR framework to structure answers even when recalling partial knowledge",
      ];
      suggestedNextSteps = [
        `Review core ${req.role} fundamentals and common architectural trade-offs`,
        "Practice mock interviewing by speaking your thought process aloud when encountering unfamiliar questions",
        "Prepare 3 concrete project deep-dives that you can reference across multiple technical scenarios",
      ];
    } else if (overallScore < 65) {
      executiveSummary = `Candidate demonstrated foundational understanding of ${req.role} concepts but responses were frequently brief and lacked the technical depth, quantifiable metrics, and edge-case awareness expected for a ${req.difficulty} level interview.`;
      strengths = [
        "Understood the intent of each question and provided on-topic responses",
        "Demonstrated working knowledge of primary domain tools",
      ];
      areasToImprove = [
        "Elaborate on architectural trade-offs rather than providing single-sentence summaries",
        "Include measurable impact (e.g. performance gains, reliability metrics, business outcomes)",
        "Discuss failure modes, caching strategies, and debugging methodologies",
      ];
      suggestedNextSteps = [
        "Practice answering technical questions using the 90-second structured architecture overview format",
        "Deepen your understanding of system constraints and trade-offs for your chosen tech stack",
      ];
    } else {
      executiveSummary = `Strong, well-articulated performance for a ${req.difficulty} ${req.role} interview. Responses demonstrated deep technical accuracy, clear communication structure, and solid engineering decision-making.`;
      strengths = [
        "Articulated technical concepts clearly with strong domain vocabulary",
        "Demonstrated practical understanding of system architecture and engineering constraints",
        "Maintained structured, confident communication throughout the session",
      ];
      areasToImprove = [
        "Continue refining concise delivery to keep long answers under 2 minutes during rapid-fire rounds",
        "Include more explicit discussion of alternative technologies considered and rejected",
      ];
      suggestedNextSteps = [
        "Practice high-level system design diagrams and distributed bottlenecks for senior rounds",
        "Refine your personal storytelling for executive behavioral interviews",
      ];
    }

    return {
      scorecard: {
        sessionId: "session-dynamic",
        overallScore,
        communicationScore: commAvg,
        technicalScore: techAvg,
        relevanceScore: relAvg,
        clarityScore: clarAvg,
        confidenceScore: confAvg,
        executiveSummary,
        strengths,
        areasToImprove,
        suggestedNextSteps,
        completedAt: new Date().toISOString(),
      },
    };
  }
}
