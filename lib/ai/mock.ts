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

// Common tech keywords to extract from resumes
const TECH_KEYWORDS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Vue", "Angular", "Node.js", "Express",
  "Python", "Django", "FastAPI", "Flask", "Java", "Spring Boot", "Go", "Golang", "Rust",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Cassandra",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "GitHub Actions", "Terraform",
  "GraphQL", "REST APIs", "gRPC", "WebSockets", "Tailwind CSS", "Redux", "Zustand",
  "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "OpenAI API", "LangChain"
];

function extractResumeProjectsAndTech(resumeText: string): { projects: string[]; techStack: string[] } {
  if (!resumeText || resumeText.trim().length < 15) {
    return { projects: [], techStack: [] };
  }

  const text = resumeText;
  const detectedTech: string[] = [];

  for (const tech of TECH_KEYWORDS) {
    const regex = new RegExp(`\\b${tech.replace(".", "\\.")}\\b`, "i");
    if (regex.test(text)) {
      detectedTech.push(tech);
    }
  }

  // Extract project names by scanning for lines with "Project:", headers, or bulleted titles
  const projects: string[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 80);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const projectMatch = line.match(/(?:project|application|platform|system|portal|app)\s*:\s*([A-Za-z0-9\s-_]+)/i);
    if (projectMatch && projectMatch[1]?.trim()) {
      projects.push(projectMatch[1].trim());
    } else if (/^(?:•|-|\*)\s*([A-Za-z0-9\s-_]{3,40})(?:\s*\||\s*\(|\s*–|\s*-)/i.test(line)) {
      const match = line.match(/^(?:•|-|\*)\s*([A-Za-z0-9\s-_]{3,40})/);
      if (match && match[1]) {
        projects.push(match[1].trim());
      }
    } else if (/(?:built|developed|created|architected|designed)\s+(?:a|an)\s+([A-Za-z0-9\s-_]{4,40})/i.test(line)) {
      const match = line.match(/(?:built|developed|created|architected|designed)\s+(?:a|an)\s+([A-Za-z0-9\s-_]{4,40})/i);
      if (match && match[1]) {
        projects.push(match[1].trim());
      }
    }
  }

  return {
    projects: Array.from(new Set(projects)).slice(0, 4),
    techStack: Array.from(new Set(detectedTech)).slice(0, 8),
  };
}

export class MockAIService implements AIService {
  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    const role = req.role;
    const { projects, techStack } = extractResumeProjectsAndTech(req.resumeText || "");
    const hasResume = projects.length > 0 || techStack.length > 0;

    const primaryProject = projects[0] || "your primary highlighted project";
    const secondaryProject = projects[1] || projects[0] || "your secondary technical application";
    const primaryTech = techStack[0] || "your chosen modern framework";
    const secondaryTech = techStack[1] || techStack[0] || "your backend or database layer";
    const thirdTech = techStack[2] || "caching and state layer";

    const questions: InterviewQuestion[] = [];

    if (hasResume) {
      // 1. Project 1 Architecture Deep Dive
      questions.push({
        id: `q_res_${Date.now()}_1`,
        order: 1,
        question: `I reviewed your resume for ${role}. In particular, I noticed your work on "${primaryProject}". Could you introduce yourself and walk me through the end-to-end architecture, your specific ownership, and why you chose ${primaryTech}?`,
        category: "introductory",
        difficulty: req.difficulty,
        contextHint: "Explain the system flow, component boundaries, your exact contributions, and key architectural choices.",
        expectedTopics: [primaryProject, primaryTech, "System Architecture", "Individual Ownership"],
      });

      // 2. Tech Stack & State / Database Probing
      questions.push({
        id: `q_res_${Date.now()}_2`,
        order: 2,
        question: `In "${primaryProject}", how did you handle data persistence and API communication between ${primaryTech} and ${secondaryTech}? What trade-offs did you encounter regarding latency or state synchronization?`,
        category: "technical",
        difficulty: req.difficulty,
        contextHint: "Highlight API contracts, serialization, caching, data consistency, and performance considerations.",
        expectedTopics: [primaryTech, secondaryTech, "Data Consistency", "API Design", "Trade-offs"],
      });

      // 3. Difficult Debugging & Performance Bottlenecks
      questions.push({
        id: `q_res_${Date.now()}_3`,
        order: 3,
        question: `What was the most challenging technical bug, race condition, or performance bottleneck you encountered while developing "${secondaryProject}" or using ${thirdTech}? How did you profile and resolve it?`,
        category: "problem-solving",
        difficulty: req.difficulty,
        contextHint: "Walk through your diagnosis methodology: reproduction, telemetry/logs, root cause, and the fix.",
        expectedTopics: ["Root Cause Analysis", "Debugging", "Profiling", "Fix & Verification"],
      });

      // 4. Behavioral & Engineering Collaboration (STAR)
      questions.push({
        id: `q_res_${Date.now()}_4`,
        order: 4,
        question: `Tell me about a time during one of these projects when requirements changed right before a release, or you had a technical disagreement on the team regarding tool selection or code design. How did you resolve it?`,
        category: "behavioral",
        difficulty: req.difficulty,
        contextHint: "Use the STAR method: Situation, Task, Action, Result with focus on team communication.",
        expectedTopics: ["Collaboration", "Conflict Resolution", "STAR Method", "Engineering Judgment"],
      });

      // 5. System Design & Scalability
      questions.push({
        id: `q_res_${Date.now()}_5`,
        order: 5,
        question: `If "${primaryProject}" experienced a sudden 50x surge in concurrent active users, what components of your architecture (e.g. database connections, memory, network bandwidth) would fail first, and how would you redesign it?`,
        category: "system-design",
        difficulty: req.difficulty,
        contextHint: "Discuss horizontal scaling, Redis caching, read replicas, asynchronous queues, and load balancing.",
        expectedTopics: ["Horizontal Scaling", "Caching", "Queues", "Bottleneck Mitigation"],
      });
    } else {
      // Role-specific non-repeating diverse questions
      const isFrontend = /frontend|react|ui|web|javascript|next/i.test(role);
      const isBackend = /backend|api|server|node|python|java|golang|sql/i.test(role);
      const isData = /data|analytics|machine learning|ai|ml/i.test(role);

      if (isFrontend) {
        questions.push(
          {
            id: `q_fe_${Date.now()}_1`,
            order: 1,
            question: `Welcome to your ${role} interview. Could you introduce yourself and describe a complex frontend application you built, focusing on how you structured component hierarchies and managed global state?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Explain component modularity, state architecture, and render optimization.",
            expectedTopics: ["Component Design", "State Management", "Performance"],
          },
          {
            id: `q_fe_${Date.now()}_2`,
            order: 2,
            question: `How do you identify, measure, and optimize Web Vitals (such as Largest Contentful Paint, INP, and cumulative layout shift) in production web applications?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss code splitting, lazy loading, image optimization, memoization, and network watermarking.",
            expectedTopics: ["Core Web Vitals", "LCP", "Code Splitting", "Bundle Optimization"],
          },
          {
            id: `q_fe_${Date.now()}_3`,
            order: 3,
            question: `How do you architect resilient error boundaries, optimistic UI updates, and offline caching when handling unreliable third-party APIs?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Mention Error Boundaries, React Query/SWR, localStorage, and retry backoff.",
            expectedTopics: ["Error Boundaries", "Optimistic Updates", "Offline Fallbacks"],
          },
          {
            id: `q_fe_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time you had to make a tough trade-off between delivering a feature quickly versus refactoring technical debt or maintaining strict accessibility standards.`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Technical Debt", "Prioritization", "STAR Framework"],
          },
          {
            id: `q_fe_${Date.now()}_5`,
            order: 5,
            question: `How would you design a high-performance, real-time collaborative workspace (like Google Docs or Figma canvas) in the browser?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss WebSockets, CRDTs / Operational Transformation, Canvas rendering, and conflict resolution.",
            expectedTopics: ["WebSockets", "CRDTs", "Virtualization", "Conflict Resolution"],
          }
        );
      } else if (isBackend) {
        questions.push(
          {
            id: `q_be_${Date.now()}_1`,
            order: 1,
            question: `Welcome. Can you introduce yourself and walk me through a distributed service or backend system you architected, explaining how data flows from API gateway to storage?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Cover gateway routing, authentication, business logic layer, and database design.",
            expectedTopics: ["Service Architecture", "API Gateway", "Database Design"],
          },
          {
            id: `q_be_${Date.now()}_2`,
            order: 2,
            question: `How do you decide between SQL relational databases (PostgreSQL/MySQL) and NoSQL stores (MongoDB/DynamoDB) when designing high-throughput transaction systems?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss ACID guarantees, schema evolution, sharding, and write/read patterns.",
            expectedTopics: ["ACID Properties", "Schema Trade-offs", "Sharding", "Indexes"],
          },
          {
            id: `q_be_${Date.now()}_3`,
            order: 3,
            question: `Describe a production outage or critical concurrency issue (like a race condition or database deadlock) you investigated. What was the root cause and resolution?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Detail log analysis, lock contention, isolation levels, and post-mortem safeguards.",
            expectedTopics: ["Concurrency", "Deadlocks", "Root Cause Analysis", "Isolation Levels"],
          },
          {
            id: `q_be_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time you had to push back on unrealistic technical requirements or advocate for code quality and test coverage against tight deadlines.`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Stakeholder Management", "Engineering Standards", "STAR Method"],
          },
          {
            id: `q_be_${Date.now()}_5`,
            order: 5,
            question: `Design a rate-limiting service capable of handling 500,000 requests per second across a global server cluster.`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss Token Bucket / Leaky Bucket algorithms, Redis cluster sliding windows, and local cache fallbacks.",
            expectedTopics: ["Rate Limiting", "Token Bucket", "Redis Sliding Window", "High Availability"],
          }
        );
      } else if (isData) {
        questions.push(
          {
            id: `q_data_${Date.now()}_1`,
            order: 1,
            question: `Can you introduce yourself and discuss an end-to-end data pipeline or analytical model you designed and deployed to production?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Discuss data ingestion, schema normalization, modeling, and business outcomes.",
            expectedTopics: ["ETL Pipelines", "Data Modeling", "Business Metrics"],
          },
          {
            id: `q_data_${Date.now()}_2`,
            order: 2,
            question: `How do you handle dirty data, missing values, and schema drift in real-time streaming pipelines?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Mention dead-letter queues, schema registries, validation layers, and imputation.",
            expectedTopics: ["Data Quality", "Schema Registry", "Dead-Letter Queues"],
          },
          {
            id: `q_data_${Date.now()}_3`,
            order: 3,
            question: `Describe a situation where an analytical query or ML inference job was running too slowly. How did you diagnose the bottleneck and optimize it?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Discuss partitioning, query execution plans, vectorization, and batching.",
            expectedTopics: ["Query Optimization", "Partitioning", "Execution Plans"],
          },
          {
            id: `q_data_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time when business stakeholders misunderstood your data insights or metrics, and how you communicated technical findings to non-technical leaders.`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method.",
            expectedTopics: ["Data Storytelling", "Stakeholder Alignment", "STAR Method"],
          },
          {
            id: `q_data_${Date.now()}_5`,
            order: 5,
            question: `How would you design a real-time event analytics platform that ingests billions of clickstream events per day with sub-second query latency?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss Kafka/Pulsar, ClickHouse/Apache Pinot, column-oriented storage, and caching.",
            expectedTopics: ["Kafka", "ClickHouse", "Columnar Storage", "Real-Time Aggregations"],
          }
        );
      } else {
        // Generic Software Engineering
        questions.push(
          {
            id: `q_gen_${Date.now()}_1`,
            order: 1,
            question: `Welcome! To start off, could you introduce yourself and tell me about the most impactful software system or application you have built for ${role}?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Explain your role, technical architecture, stack choices, and measurable results.",
            expectedTopics: ["System Overview", "Ownership", "Technical Stack"],
          },
          {
            id: `q_gen_${Date.now()}_2`,
            order: 2,
            question: `What are the core technical trade-offs you evaluate when selecting technologies, frameworks, and architecture patterns for ${role}?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss maintainability, execution performance, security, and developer velocity.",
            expectedTopics: ["Design Trade-offs", "Scalability", "Maintainability"],
          },
          {
            id: `q_gen_${Date.now()}_3`,
            order: 3,
            question: `Walk me through a difficult technical bug or unexpected edge-case failure you diagnosed in production. What was your investigation process?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Walk through reproduction, log analysis, root cause, and unit/integration regression tests.",
            expectedTopics: ["Debugging Process", "Root Cause Analysis", "Testing Strategy"],
          },
          {
            id: `q_gen_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time when you received constructive feedback on your code or architecture during a peer review. How did you handle it?`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Feedback Receptivity", "Code Review", "STAR Method"],
          },
          {
            id: `q_gen_${Date.now()}_5`,
            order: 5,
            question: `How would you architect a fault-tolerant notification or webhook delivery service that guarantees at-least-once delivery with exponential retry backoff?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss message queues, idempotent consumers, dead-letter queues, and jittered backoff.",
            expectedTopics: ["Idempotency", "Message Queues", "Exponential Backoff", "Dead-Letter Queues"],
          }
        );
      }
    }

    // Ensure we return the requested count
    let selected = [...questions];
    while (selected.length < req.count) {
      const idx = selected.length + 1;
      selected.push({
        id: `q_extra_${Date.now()}_${idx}`,
        order: idx,
        question: `How do you ensure zero-downtime deployments, database schema migrations, and canary releases in production systems?`,
        category: "system-design",
        difficulty: req.difficulty,
        contextHint: "Discuss blue-green deployments, backward-compatible migrations, and feature flags.",
        expectedTopics: ["Zero-Downtime Deployments", "Schema Migrations", "Feature Flags"],
      });
    }

    return {
      questions: selected.slice(0, req.count).map((q, i) => ({ ...q, order: i + 1 })),
    };
  }

  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    const text = req.userAnswer.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lower = text.toLowerCase();

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

    if (wordCount < 55) {
      const hasTechTerms = /(api|database|react|cache|state|service|latency|scaling|sql|async|component|schema|git|ci\/cd|pipeline)/i.test(lower);
      const score = hasTechTerms ? 7.5 : 6.2;

      return {
        evaluation: {
          questionId: req.question.id,
          score,
          communicationScore: hasTechTerms ? 7.8 : 6.8,
          technicalScore: hasTechTerms ? 7.5 : 5.8,
          relevanceScore: 7.8,
          clarityScore: 7.2,
          confidenceScore: 7.0,
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

    const rawOverall = Math.round(((commAvg + techAvg + relAvg + clarAvg + confAvg) / 5) * 10);
    const overallScore = Math.min(100, Math.max(12, rawOverall));

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
