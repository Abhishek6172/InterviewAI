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
    await new Promise((r) => setTimeout(r, 450));

    const role = req.role.toLowerCase();

    let questionBank: InterviewQuestion[] = [];

    if (role.includes("frontend") || role.includes("ui") || role.includes("react")) {
      questionBank = [
        {
          id: `q_fe_${Date.now()}_1`,
          order: 1,
          question: "Can you walk me through a challenging frontend feature you built, focusing on how you managed complex state and optimized rendering performance?",
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
        {
          id: `q_fe_${Date.now()}_4`,
          order: 4,
          question: "How do you approach web accessibility (a11y) and responsive design when building complex interactive components like modals or data grids?",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Mention ARIA labels, focus traps, keyboard navigation, and responsive CSS.",
          expectedTopics: ["ARIA", "Keyboard navigation", "Responsive CSS"],
        },
        {
          id: `q_fe_${Date.now()}_5`,
          order: 5,
          question: "If our client-side bundle size suddenly increased by 300KB after a sprint, how would you diagnose and resolve the regression?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Detail bundle analyzers, tree-shaking, code-splitting, and dynamic imports.",
          expectedTopics: ["Webpack/Vite Bundle Analyzer", "Code Splitting", "Tree Shaking"],
        },
      ];
    } else if (role.includes("backend") || role.includes("distributed") || role.includes("cloud")) {
      questionBank = [
        {
          id: `q_be_${Date.now()}_1`,
          order: 1,
          question: "Can you describe the architecture of a backend service you built, focusing on how data flows from API gateway down to storage?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss REST/gRPC endpoints, validation, service layer, and database transactions.",
          expectedTopics: ["API Gateway", "Microservices", "Data layer", "Concurrency"],
        },
        {
          id: `q_be_${Date.now()}_2`,
          order: 2,
          question: "How do you design database schemas and choose between relational (PostgreSQL) vs NoSQL for high-write workloads?",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Compare ACID compliance, indexing, partitioning, and read/write scaling.",
          expectedTopics: ["PostgreSQL", "NoSQL", "Indexing", "Partitioning"],
        },
        {
          id: `q_be_${Date.now()}_3`,
          order: 3,
          question: "Tell me about a critical production bug or downtime you investigated. What was the root cause and how did you resolve it?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Structure with Situation, Action, Post-Mortem, and preventative monitors added.",
          expectedTopics: ["Debugging", "Post-Mortem", "Observability"],
        },
        {
          id: `q_be_${Date.now()}_4`,
          order: 4,
          question: "How do you implement rate limiting, caching with Redis, and authentication token verification at scale?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss token bucket / leaky bucket algorithms, cache invalidation, and JWT / sessions.",
          expectedTopics: ["Redis", "Rate Limiting", "JWT", "Cache Invalidation"],
        },
        {
          id: `q_be_${Date.now()}_5`,
          order: 5,
          question: "What strategies do you use to ensure zero-downtime database migrations when altering large tables with millions of rows?",
          category: "system-design",
          difficulty: req.difficulty,
          contextHint: "Explain expand-and-contract pattern, dual writing, and backfilling.",
          expectedTopics: ["Zero-downtime migrations", "Dual writing", "Expand-and-contract"],
        },
      ];
    } else if (role.includes("product") || role.includes("pm")) {
      questionBank = [
        {
          id: `q_pm_${Date.now()}_1`,
          order: 1,
          question: "How do you evaluate and prioritize competing feature requests from high-value enterprise customers versus growth features for free-tier users?",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Use frameworks like RICE or Kano, business alignment, and data-backed rationale.",
          expectedTopics: ["RICE Framework", "Customer segmentation", "Business impact"],
        },
        {
          id: `q_pm_${Date.now()}_2`,
          order: 2,
          question: "Imagine our user onboarding completion rate dropped by 20% week-over-week. Walk me step-by-step through how you would investigate the root cause.",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Segment funnels by device, cohort, release timing, and user journey drop-offs.",
          expectedTopics: ["Funnel analytics", "Cohort analysis", "Hypothesis testing"],
        },
        {
          id: `q_pm_${Date.now()}_3`,
          order: 3,
          question: "Tell me about a time you had to say 'no' to a key stakeholder or executive. How did you manage the conversation?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Highlight data-driven empathy, alternative proposals, and alignment on shared north star metrics.",
          expectedTopics: ["Stakeholder management", "Data storytelling", "Conflict resolution"],
        },
        {
          id: `q_pm_${Date.now()}_4`,
          order: 4,
          question: "How do you define and track the North Star Metric and secondary health guardrail metrics for a new product launch?",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Explain the connection between customer value, retention, and guardrail metrics.",
          expectedTopics: ["North Star Metric", "Retention", "Guardrail metrics"],
        },
      ];
    } else if (role.includes("data") || role.includes("analyst") || role.includes("scientist")) {
      questionBank = [
        {
          id: `q_da_${Date.now()}_1`,
          order: 1,
          question: "Can you walk me through a data analysis project where your findings directly influenced a business or engineering decision?",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Focus on problem framing, SQL/Python methodology, key insight, and measurable outcome.",
          expectedTopics: ["SQL", "Business Impact", "Insights Communication"],
        },
        {
          id: `q_da_${Date.now()}_2`,
          order: 2,
          question: "How do you structure an A/B test when sample sizes are small or variance is high? What statistical pitfalls do you watch out for?",
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss statistical power, p-values, p-hacking, and minimum detectable effect (MDE).",
          expectedTopics: ["A/B Testing", "Statistical Significance", "Sample Size"],
        },
        {
          id: `q_da_${Date.now()}_3`,
          order: 3,
          question: "Describe a time you encountered dirty, incomplete, or contradictory data in a key pipeline. How did you validate and clean it?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Detail anomaly detection, imputation vs deletion trade-offs, and communication with data producers.",
          expectedTopics: ["Data Cleaning", "Data Quality", "Anomaly Detection"],
        },
      ];
    } else {
      // General Software Engineer / Custom Role fallback
      questionBank = [
        {
          id: `q_gen_${Date.now()}_1`,
          order: 1,
          question: `Can you introduce your background in ${req.role} and explain the technical architecture of a recent project you are proud of?`,
          category: "introductory",
          difficulty: req.difficulty,
          contextHint: "Give a crisp 90-second overview covering technical stack, your specific ownership, and key results.",
          expectedTopics: ["Project Overview", "Ownership", "Technical Stack"],
        },
        {
          id: `q_gen_${Date.now()}_2`,
          order: 2,
          question: `What are the most important design trade-offs you consider when architecting systems for ${req.role} at a ${req.difficulty} level?`,
          category: "technical",
          difficulty: req.difficulty,
          contextHint: "Discuss performance, maintainability, scalability, and testability.",
          expectedTopics: ["Design Trade-offs", "Scalability", "Maintainability"],
        },
        {
          id: `q_gen_${Date.now()}_3`,
          order: 3,
          question: "Tell me about a time you faced an ambiguous technical requirement or disagreement with a team member. How did you achieve resolution?",
          category: "behavioral",
          difficulty: req.difficulty,
          contextHint: "Use the STAR method: Situation, Task, Action, Result with focus on collaboration.",
          expectedTopics: ["Collaboration", "Conflict Resolution", "STAR method"],
        },
        {
          id: `q_gen_${Date.now()}_4`,
          order: 4,
          question: "Describe how you approach automated testing, continuous integration, and code quality before shipping code to production.",
          category: "problem-solving",
          difficulty: req.difficulty,
          contextHint: "Discuss unit vs integration tests, mocking, CI/CD pipelines, and rollback safety.",
          expectedTopics: ["CI/CD", "Unit/Integration Testing", "Code Quality"],
        },
        {
          id: `q_gen_${Date.now()}_5`,
          order: 5,
          question: "Walk me through how you would optimize a slow-performing API endpoint or query when traffic spikes 10x.",
          category: "system-design",
          difficulty: req.difficulty,
          contextHint: "Cover profiling, caching, asynchronous workers, and database connection pooling.",
          expectedTopics: ["Profiling", "Caching", "Async Queues", "Scaling"],
        },
      ];
    }

    // Adjust for requested count
    let selected = [...questionBank];
    while (selected.length < req.count) {
      const idx = selected.length + 1;
      selected.push({
        id: `q_extra_${Date.now()}_${idx}`,
        order: idx,
        question: `How do you approach debugging and monitoring when unexpected errors occur in ${req.role} workflows?`,
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
    await new Promise((r) => setTimeout(r, 650));

    const words = req.userAnswer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lowerText = req.userAnswer.toLowerCase();

    let score = 7.5;
    let commScore = 8.0;
    let techScore = 7.5;
    let relScore = 8.0;
    let clarityScore = 8.0;
    let confScore = 7.5;

    let whatWasGood = [
      "Directly engaged with the question prompt without unnecessary delay",
      "Demonstrated logical flow and structured thinking",
    ];

    let whatCouldImprove = [
      "Incorporate more measurable metrics (e.g. latency reduced by X%, conversion increased by Y%)",
      "Explicitly discuss alternative trade-offs you considered before picking your approach",
    ];

    if (wordCount < 18) {
      score = 5.0;
      commScore = 5.0;
      techScore = 5.0;
      relScore = 6.0;
      clarityScore = 5.5;
      confScore = 4.5;
      whatWasGood = ["Answered concisely without rambling"];
      whatCouldImprove = [
        "Your response was quite brief. Elaborate with specific technical details and architecture context.",
        "Use the STAR method to structure your situation, actions, and quantifiable outcomes.",
      ];
    } else if (wordCount > 60) {
      score = 8.8;
      commScore = 9.0;
      techScore = 8.5;
      relScore = 9.0;
      clarityScore = 8.5;
      confScore = 8.5;
      whatWasGood = [
        "Provided strong context and concrete technical terminology",
        "Clearly explained the rationale behind decisions and trade-offs",
        "Demonstrated solid domain understanding matching your target role",
      ];
      whatCouldImprove = [
        "Keep delivery focused to avoid exceeding the ideal 90-120 second interview answer window",
      ];
    }

    // Check if we should trigger a contextual follow-up question
    let shouldFollowUp = false;
    let followUpQuestionText = undefined;
    let followUpQuestion: InterviewQuestion | undefined = undefined;

    if (req.canFollowUp) {
      if (lowerText.includes("project") || lowerText.includes("built") || lowerText.includes("app") || lowerText.includes("mern") || lowerText.includes("react")) {
        shouldFollowUp = true;
        followUpQuestionText = "You mentioned that project — what was the hardest technical challenge or bottleneck you faced while building it, and how did you resolve it?";
      } else if (lowerText.includes("database") || lowerText.includes("sql") || lowerText.includes("postgres") || lowerText.includes("mongo")) {
        shouldFollowUp = true;
        followUpQuestionText = "Regarding your database choices, how did you handle indexing, query optimization, or eventual consistency?";
      } else if (lowerText.includes("team") || lowerText.includes("conflict") || lowerText.includes("disagree")) {
        shouldFollowUp = true;
        followUpQuestionText = "Looking back on that team situation, what would you do differently today to align stakeholders faster?";
      }

      if (shouldFollowUp && followUpQuestionText) {
        followUpQuestion = {
          id: `fu_${Date.now()}`,
          order: req.question.order + 1,
          question: followUpQuestionText,
          category: req.question.category,
          difficulty: req.difficulty,
          isFollowUp: true,
          parentQuestionId: req.question.id,
          contextHint: "Dive deeper into specific challenges, trade-offs, and learnings from your previous answer.",
        };
      }
    }

    return {
      evaluation: {
        questionId: req.question.id,
        score,
        communicationScore: commScore,
        technicalScore: techScore,
        relevanceScore: relScore,
        clarityScore,
        confidenceScore: confScore,
        feedback:
          wordCount < 18
            ? "Your response gave a quick high-level glance, but lacked the specific technical depth and concrete examples interviewers expect."
            : "Strong, well-structured answer. You articulated your thought process clearly and grounded your response in realistic engineering considerations.",
        whatWasGood,
        whatCouldImprove,
        shouldFollowUp,
        followUpQuestionText,
      },
      followUpQuestion,
    };
  }

  async generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse> {
    await new Promise((r) => setTimeout(r, 750));

    const evals = Object.values(req.evaluations);
    const count = Math.max(1, evals.length);

    const comm = evals.reduce((a, b) => a + (b.communicationScore || 7.5), 0) / count;
    const tech = evals.reduce((a, b) => a + (b.technicalScore || 7.5), 0) / count;
    const rel = evals.reduce((a, b) => a + (b.relevanceScore || 8.0), 0) / count;
    const clar = evals.reduce((a, b) => a + (b.clarityScore || 8.0), 0) / count;
    const conf = evals.reduce((a, b) => a + (b.confidenceScore || 7.5), 0) / count;

    const overall = Math.round(((comm + tech + rel + clar + conf) / 5) * 10);

    return {
      scorecard: {
        sessionId: "session-mock",
        overallScore: Math.min(100, Math.max(45, overall)),
        communicationScore: Number(comm.toFixed(1)),
        technicalScore: Number(tech.toFixed(1)),
        relevanceScore: Number(rel.toFixed(1)),
        clarityScore: Number(clar.toFixed(1)),
        confidenceScore: Number(conf.toFixed(1)),
        executiveSummary: `You demonstrated solid foundational interview readiness for a ${req.difficulty} ${req.role} position. Your responses showed clear structured thinking and relevant domain terminology. Focusing on quantifiable metrics and explaining alternative trade-offs will elevate your answers to top-percentile candidate quality.`,
        strengths: [
          "Structured communication logically and directly addressed the interviewer prompts",
          "Demonstrated practical understanding of engineering constraints and trade-offs",
          "Maintained a professional, confident tone throughout the verbal dialogue",
          "Articulated technical terminology accurately within your target role domain",
        ],
        areasToImprove: [
          "Incorporate more quantifiable business/system metrics (e.g. latency, throughput, conversion impact)",
          "Elaborate more deeply on edge cases, database failure modes, and rollback strategies",
          "Keep introductory project summaries under 90 seconds to preserve time for deep-dive questions",
        ],
        suggestedNextSteps: [
          "Practice explaining past projects in 90 seconds using a concise STAR outline",
          "Review REST API vs gRPC / GraphQL fundamentals and database indexing trade-offs",
          "Give more measurable impact and explicit metric benchmarks in behavioral answers",
        ],
        completedAt: new Date().toISOString(),
      },
    };
  }
}
