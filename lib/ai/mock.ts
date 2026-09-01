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

// Multi-disciplinary keywords across Tech, Legal, Medical, Finance, Marketing, Engineering
const DOMAIN_KEYWORDS = [
  // Legal & Advocacy
  "Litigation", "Constitutional Law", "Corporate Law", "Arbitration", "Contract Drafting",
  "Due Diligence", "Intellectual Property", "Criminal Law", "Civil Law", "Dispute Resolution",
  "High Court", "Supreme Court", "District Court", "Legal Compliance", "M&A", "Bar Council",
  // Healthcare & Medicine
  "Clinical Diagnosis", "Patient Care", "Emergency Triage", "Pharmacology", "Surgical Procedures",
  "Internal Medicine", "Pediatrics", "Cardiology", "Oncology", "Medical Ethics",
  // Finance & Accounting
  "Financial Modeling", "Auditing", "Taxation", "Valuation", "IFRS", "GAAP",
  "Risk Management", "Capital Markets", "Portfolio Management", "Cash Flow Forecasting",
  // Engineering & Tech
  "React", "Next.js", "TypeScript", "Python", "Java", "Spring Boot", "Node.js",
  "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "REST APIs", "System Architecture",
  // Marketing & Product
  "Go-To-Market", "Customer Acquisition", "Brand Strategy", "SEO", "User Retention", "Product Roadmap"
];

function extractResumeEntityAndHighlights(resumeText: string): {
  projectsOrCases: string[];
  keyHighlights: string[];
} {
  if (!resumeText || resumeText.trim().length < 15) {
    return { projectsOrCases: [], keyHighlights: [] };
  }

  const text = resumeText;
  const detectedHighlights: string[] = [];

  for (const kw of DOMAIN_KEYWORDS) {
    const regex = new RegExp(`\\b${kw.replace(".", "\\.")}\\b`, "i");
    if (regex.test(text)) {
      detectedHighlights.push(kw);
    }
  }

  // Extract titles by looking for headers, bulleted titles, "Case:", "Project:", "Matter:", etc.
  const projectsOrCases: string[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 80);

  for (const line of lines) {
    const match = line.match(/(?:case|matter|project|application|engagement|campaign|initiative|suit)\s*:\s*([A-Za-z0-9\s-_,]+)/i);
    if (match && match[1]?.trim()) {
      projectsOrCases.push(match[1].trim());
    } else if (/^(?:•|-|\*)\s*([A-Za-z0-9\s-_]{3,45})(?:\s*\||\s*\(|\s*–|\s*-\s*[A-Z]|\s*:)/i.test(line)) {
      const bulletMatch = line.match(/^(?:•|-|\*)\s*([A-Za-z0-9\s-_]{3,45})/);
      if (bulletMatch && bulletMatch[1]) {
        projectsOrCases.push(bulletMatch[1].trim());
      }
    } else if (/(?:represented|handled|advised|drafted|argued|managed|built|developed)\s+([A-Za-z0-9\s-_]{4,40})/i.test(line)) {
      const verbMatch = line.match(/(?:represented|handled|advised|drafted|argued|managed|built|developed)\s+([A-Za-z0-9\s-_]{4,40})/i);
      if (verbMatch && verbMatch[1]) {
        projectsOrCases.push(verbMatch[1].trim());
      }
    }
  }

  return {
    projectsOrCases: Array.from(new Set(projectsOrCases)).slice(0, 4),
    keyHighlights: Array.from(new Set(detectedHighlights)).slice(0, 8),
  };
}

export class MockAIService implements AIService {
  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    const role = req.role;
    const lowerRole = role.toLowerCase();
    const { projectsOrCases, keyHighlights } = extractResumeEntityAndHighlights(req.resumeText || "");
    const hasResume = projectsOrCases.length > 0 || keyHighlights.length > 0;

    const primaryWork = projectsOrCases[0] || "your primary highlighted engagement from your resume";
    const secondaryWork = projectsOrCases[1] || projectsOrCases[0] || "your secondary professional matter";
    const primaryTopic = keyHighlights[0] || "your primary core competency";
    const secondaryTopic = keyHighlights[1] || keyHighlights[0] || "practical regulatory frameworks";

    const questions: InterviewQuestion[] = [];

    const isLegal = /advocate|lawyer|attorney|legal|counsel|solicitor|jurist|paralegal/i.test(lowerRole);
    const isMedical = /doctor|nurse|physician|surgeon|medical|healthcare|pharmacist/i.test(lowerRole);
    const isFinance = /accountant|ca|finance|financial|auditor|investment|banker|tax/i.test(lowerRole);
    const isFrontend = /frontend|react|ui|web|javascript|next/i.test(lowerRole);
    const isBackend = /backend|api|server|node|python|java|golang|sql/i.test(lowerRole);

    if (hasResume) {
      if (isLegal) {
        questions.push(
          {
            id: `q_law_${Date.now()}_1`,
            order: 1,
            question: `I reviewed your resume for the ${role} position. In particular, I noticed your work on "${primaryWork}". Could you introduce yourself and walk me through the legal strategy, statutory provisions, and your specific arguments in that matter?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Detail the court/jurisdiction, governing statutes, your pleading strategy, and the case outcome.",
            expectedTopics: [primaryWork, primaryTopic, "Statutory Provisions", "Case Strategy"],
          },
          {
            id: `q_law_${Date.now()}_2`,
            order: 2,
            question: `When handling matters involving ${primaryTopic} or ${secondaryTopic}, how do you structure legal research to counter adverse precedents and navigate ambiguous statutory provisions?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Explain your methodology for case law analysis, statutory interpretation, and doctrine application.",
            expectedTopics: [primaryTopic, secondaryTopic, "Precedent Analysis", "Legal Interpretation"],
          },
          {
            id: `q_law_${Date.now()}_3`,
            order: 3,
            question: `Describe a challenging courtroom situation, intense cross-examination, or urgent injunction hearing in "${secondaryWork}". How did you respond to unexpected evidence or hostile arguments?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Walk through on-the-spot reasoning, procedural objections, and strategic pivoting.",
            expectedTopics: ["Cross-Examination", "Procedural Law", "Crisis Management"],
          },
          {
            id: `q_law_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time when a client wanted to pursue an aggressive legal course of action that posed ethical boundaries or significant litigation risks. How did you counsel them?`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR framework: Situation, Task, Action, Result with focus on professional ethics.",
            expectedTopics: ["Professional Ethics", "Client Counseling", "Risk Assessment", "STAR Method"],
          },
          {
            id: `q_law_${Date.now()}_5`,
            order: 5,
            question: `With rapid changes in digital evidence and corporate regulations, how do you see dispute resolution evolving in ${primaryTopic}, and how do you prepare complex briefs for appellate benches?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss appellate advocacy, regulatory shifts, ADR mechanisms, and document discovery.",
            expectedTopics: ["Appellate Advocacy", "ADR", "Regulatory Evolution"],
          }
        );
      } else {
        // Universal Career with Resume
        questions.push(
          {
            id: `q_res_${Date.now()}_1`,
            order: 1,
            question: `I reviewed your resume for ${role}. In particular, I noticed your work on "${primaryWork}". Could you introduce yourself and walk me through your strategic approach, core responsibilities, and key results achieved?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: `Highlight your methodology, domain standards for ${role}, and measurable outcomes.`,
            expectedTopics: [primaryWork, primaryTopic, "Methodology", "Key Results"],
          },
          {
            id: `q_res_${Date.now()}_2`,
            order: 2,
            question: `In "${primaryWork}", how did you handle critical standards and technical trade-offs involving ${primaryTopic} and ${secondaryTopic}?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Detail best practices, risk mitigation, and industry compliance.",
            expectedTopics: [primaryTopic, secondaryTopic, "Industry Standards", "Trade-offs"],
          },
          {
            id: `q_res_${Date.now()}_3`,
            order: 3,
            question: `What was the most challenging obstacle, unexpected emergency, or complex crisis you encountered in "${secondaryWork}"? How did you diagnose and resolve it?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Walk through root cause analysis, action steps taken, and lessons learned.",
            expectedTopics: ["Crisis Resolution", "Problem Solving", "Corrective Actions"],
          },
          {
            id: `q_res_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time when you faced conflicting stakeholder priorities, a tough negotiation, or strict deadline pressures in your ${role} work. How did you handle it?`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Stakeholder Management", "Negotiation", "STAR Framework"],
          },
          {
            id: `q_res_${Date.now()}_5`,
            order: 5,
            question: `How do you stay ahead of emerging industry standards, regulatory policies, and modern innovations in ${role} to continuously elevate your professional practice?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss continuous professional development, innovation, and long-term vision.",
            expectedTopics: ["Industry Trends", "Professional Excellence", "Future Planning"],
          }
        );
      }
    } else {
      // Role-specific questions without resume
      if (isLegal) {
        questions.push(
          {
            id: `q_law_def_${Date.now()}_1`,
            order: 1,
            question: `Welcome to your ${role} interview. Could you introduce your legal background, primary areas of practice (e.g. civil, criminal, corporate, constitutional), and a major matter you recently worked on?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "State your court jurisdiction, specialization, and pleading experience.",
            expectedTopics: ["Practice Areas", "Pleading Experience", "Jurisdiction"],
          },
          {
            id: `q_law_def_${Date.now()}_2`,
            order: 2,
            question: `What is your step-by-step approach to statutory interpretation when drafting writ petitions, corporate agreements, or written statements?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss literal vs purposive interpretation, precedent citing, and jurisdiction clauses.",
            expectedTopics: ["Drafting Standards", "Statutory Interpretation", "Case Research"],
          },
          {
            id: `q_law_def_${Date.now()}_3`,
            order: 3,
            question: `Walk me through how you prepare for witness cross-examination or address adverse oral observations from the bench during urgent hearings.`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Highlight evidence impeachment, document referencing, and composure.",
            expectedTopics: ["Cross-Examination", "Bench Decorum", "Argument Adaptation"],
          },
          {
            id: `q_law_def_${Date.now()}_4`,
            order: 4,
            question: `Tell me about an ethical dilemma you faced in legal practice (such as conflict of interest or confidential disclosures) and how you navigated it adhering to bar regulations.`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Bar Ethics", "Conflict of Interest", "STAR Method"],
          },
          {
            id: `q_law_def_${Date.now()}_5`,
            order: 5,
            question: `How do you evaluate whether a dispute is better resolved through Alternative Dispute Resolution (Mediation/Arbitration) versus full-scale court litigation?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss cost-benefit analysis, enforceability of awards, and client commercial objectives.",
            expectedTopics: ["ADR vs Litigation", "Arbitration Clauses", "Enforceability"],
          }
        );
      } else if (isMedical) {
        questions.push(
          {
            id: `q_med_def_${Date.now()}_1`,
            order: 1,
            question: `Welcome to your ${role} interview. Could you introduce your clinical training, areas of medical focus, and walk me through a challenging patient diagnosis you managed?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Cover patient history, differential diagnosis, and treatment plan.",
            expectedTopics: ["Clinical Background", "Differential Diagnosis", "Patient Management"],
          },
          {
            id: `q_med_def_${Date.now()}_2`,
            order: 2,
            question: `How do you manage emergency triage protocols when multiple patients present with acute, deteriorating vitals simultaneously?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss ABCDE triage, critical intervention, and rapid diagnostics.",
            expectedTopics: ["Emergency Triage", "Acute Care", "Protocols"],
          },
          {
            id: `q_med_def_${Date.now()}_3`,
            order: 3,
            question: `Describe a situation where a patient exhibited atypical symptoms or reacted adversely to standard medication. How did you adjust your clinical plan?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Discuss pharmacovigilance, multidisciplinary consults, and stabilization.",
            expectedTopics: ["Adverse Events", "Clinical Adjustment", "Consultation"],
          },
          {
            id: `q_med_def_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a difficult conversation where you had to deliver a critical diagnosis or break bad news to a patient and their family.`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method with focus on empathy and clarity.",
            expectedTopics: ["Patient Communication", "Empathy", "STAR Framework"],
          },
          {
            id: `q_med_def_${Date.now()}_5`,
            order: 5,
            question: `How do you incorporate evidence-based medicine and updated clinical trial guidelines into standard hospital protocols?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss clinical governance, peer review, and quality improvement.",
            expectedTopics: ["Evidence-Based Medicine", "Clinical Governance", "Safety Protocols"],
          }
        );
      } else if (isFinance) {
        questions.push(
          {
            id: `q_fin_def_${Date.now()}_1`,
            order: 1,
            question: `Welcome to your ${role} interview. Could you introduce yourself and walk me through a major financial model, audit engagement, or valuation project you spearheaded?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: "Detail model assumptions, methodology (DCF, multiples, audit sampling), and outcomes.",
            expectedTopics: ["Financial Modeling", "Valuation", "Assumptions"],
          },
          {
            id: `q_fin_def_${Date.now()}_2`,
            order: 2,
            question: `How do you evaluate capital structure trade-offs between debt financing, equity dilution, and internal cash reinvestment under high inflation?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss WACC, interest coverage ratios, cost of capital, and debt covenants.",
            expectedTopics: ["WACC", "Capital Structure", "Cost of Capital"],
          },
          {
            id: `q_fin_def_${Date.now()}_3`,
            order: 3,
            question: `Describe a discrepancy or material misstatement you detected during a financial audit or closing cycle. How did you investigate the root cause?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Detail reconciliation, forensic review, internal controls, and management escalation.",
            expectedTopics: ["Forensic Audit", "Internal Controls", "Reconciliation"],
          },
          {
            id: `q_fin_def_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time when business unit managers resisted budgetary cuts or financial governance controls. How did you negotiate alignment?`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR framework.",
            expectedTopics: ["Budget Negotiation", "Financial Governance", "STAR Method"],
          },
          {
            id: `q_fin_def_${Date.now()}_5`,
            order: 5,
            question: `How do you design automated treasury and financial reporting controls that mitigate liquidity risk and ensure strict regulatory compliance?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss ERP systems, liquidity stress testing, and internal control frameworks.",
            expectedTopics: ["Treasury Controls", "Stress Testing", "Regulatory Compliance"],
          }
        );
      } else {
        // Generic / Custom Career Default
        questions.push(
          {
            id: `q_cust_def_${Date.now()}_1`,
            order: 1,
            question: `Welcome! To start off your ${role} interview, could you introduce yourself and discuss your professional background and the most impactful project or achievement in your career?`,
            category: "introductory",
            difficulty: req.difficulty,
            contextHint: `Explain your core competencies, standard practices in ${role}, and measurable results.`,
            expectedTopics: ["Professional Background", "Key Achievement", "Core Skills"],
          },
          {
            id: `q_cust_def_${Date.now()}_2`,
            order: 2,
            question: `What are the most critical professional standards, methodologies, and quality benchmarks you maintain when executing work as a ${role}?`,
            category: "technical",
            difficulty: req.difficulty,
            contextHint: "Discuss industry best practices, compliance, and quality control.",
            expectedTopics: ["Industry Standards", "Methodology", "Quality Benchmarks"],
          },
          {
            id: `q_cust_def_${Date.now()}_3`,
            order: 3,
            question: `Walk me through a high-stakes crisis or unexpected problem you had to solve under tight deadlines in ${role}. What was your resolution strategy?`,
            category: "problem-solving",
            difficulty: req.difficulty,
            contextHint: "Detail diagnosis, decision-making, and outcome.",
            expectedTopics: ["Crisis Management", "Problem Solving", "Decision Making"],
          },
          {
            id: `q_cust_def_${Date.now()}_4`,
            order: 4,
            question: `Tell me about a time you handled a difficult stakeholder, client disagreement, or received critical feedback on your work. How did you address it?`,
            category: "behavioral",
            difficulty: req.difficulty,
            contextHint: "Use the STAR method: Situation, Task, Action, Result.",
            expectedTopics: ["Stakeholder Relations", "Feedback", "STAR Method"],
          },
          {
            id: `q_cust_def_${Date.now()}_5`,
            order: 5,
            question: `Looking ahead, what major industry transformations or technological innovations do you foresee impacting ${role}, and how are you preparing for them?`,
            category: "system-design",
            difficulty: req.difficulty,
            contextHint: "Discuss future trends, strategic foresight, and continuous improvement.",
            expectedTopics: ["Industry Trends", "Strategic Planning", "Adaptability"],
          }
        );
      }
    }

    let selected = [...questions];
    while (selected.length < req.count) {
      const idx = selected.length + 1;
      selected.push({
        id: `q_extra_${Date.now()}_${idx}`,
        order: idx,
        question: `How do you measure success and ensure continuous professional excellence in your day-to-day responsibilities as a ${role}?`,
        category: "system-design",
        difficulty: req.difficulty,
        contextHint: "Discuss KPIs, professional growth, and quality benchmarks.",
        expectedTopics: ["KPIs", "Quality Benchmarks", "Continuous Improvement"],
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
          feedback: `You indicated that you do not know the answer ("${text || "No response"}"). In a professional interview for ${req.role}, giving an 'I don't know' response without demonstrating problem-solving attempts results in a failing score for that question. Even when uncertain, articulate what you do know, ask clarifying questions, or discuss related principles.`,
          whatWasGood: ["Acknowledged knowledge boundary promptly"],
          whatCouldImprove: [
            "Never end with 'I don't know' — explain how you would investigate or analyze the unknown scenario",
            "Discuss related domain standards, statutory or technical principles to demonstrate professional intuition",
            "Ask clarifying questions to the interviewer to break down complex questions",
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
          feedback: `Your response was only ${wordCount} words long. While directly on-topic, it was too brief to demonstrate the professional depth expected for a ${req.difficulty} ${req.role} interview.`,
          whatWasGood: ["Direct and concise response"],
          whatCouldImprove: [
            "Expand your answer with specific real-world examples, methodologies, and outcomes",
            "Use the STAR method (Situation, Task, Action, Result) to provide concrete context",
            "Mention measurable results or ethical considerations from your experience",
          ],
          shouldFollowUp: false,
        },
      };
    }

    if (wordCount < 55) {
      return {
        evaluation: {
          questionId: req.question.id,
          score: 7.4,
          communicationScore: 7.8,
          technicalScore: 7.3,
          relevanceScore: 7.8,
          clarityScore: 7.2,
          confidenceScore: 7.0,
          feedback: `Solid answer explaining the core concept. To reach the top percentile in ${req.role} interviews, elaborate further on the trade-offs you evaluated and the specific metrics or constraints you operated under.`,
          whatWasGood: [
            "Good articulation of foundational concepts",
            "Clear logical progression in your explanation",
          ],
          whatCouldImprove: [
            "Include quantifiable impact or specific case/statute/project citations",
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
        feedback: `Excellent, comprehensive answer. You structured your explanation logically, incorporated concrete domain terminology for ${req.role}, and demonstrated strong professional depth.`,
        whatWasGood: [
          "Detailed domain depth with clear context and methodology",
          "Demonstrated practical understanding of industry constraints and standards",
          "Well-structured communication matching senior professional standards",
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
      executiveSummary = `Candidate answered 'I don't know' or gave minimal responses to ${unknownCount} out of ${questions.length} questions during the ${req.role} interview. To pass professional screenings, candidates must attempt to reason through unfamiliar topics out loud and discuss relevant industry standards.`;
      strengths = [
        "Transparent about immediate knowledge boundaries without guessing arbitrarily",
        "Completed the full sequence of interview questions",
      ];
      areasToImprove = [
        "Never answer 'I don't know' in isolation — articulate how you would analyze or investigate the scenario",
        "Prepare core foundational concepts for your target profession",
        "Use the STAR framework to structure answers even when recalling partial knowledge",
      ];
      suggestedNextSteps = [
        `Review core ${req.role} fundamentals and standard professional frameworks`,
        "Practice mock interviewing by speaking your thought process aloud when encountering unfamiliar questions",
      ];
    } else if (overallScore < 65) {
      executiveSummary = `Candidate demonstrated foundational understanding of ${req.role} concepts but responses were frequently brief and lacked the depth, specific citations, and edge-case awareness expected for a ${req.difficulty} level interview.`;
      strengths = [
        "Understood the intent of each question and provided on-topic responses",
        "Demonstrated working knowledge of primary domain concepts",
      ];
      areasToImprove = [
        "Elaborate on real-world methodologies and decision trade-offs",
        "Include measurable impact (e.g. case precedents, cost reductions, risk mitigations, business outcomes)",
      ];
      suggestedNextSteps = [
        "Practice answering questions using structured 90-second case study format",
        "Deepen your understanding of regulatory constraints and ethics for your field",
      ];
    } else {
      executiveSummary = `Strong, well-articulated performance for a ${req.difficulty} ${req.role} interview. Responses demonstrated deep domain accuracy, clear communication structure, and solid professional decision-making.`;
      strengths = [
        "Articulated professional concepts clearly with strong domain vocabulary",
        "Demonstrated practical understanding of industry standards and ethics",
        "Maintained structured, confident communication throughout the session",
      ];
      areasToImprove = [
        "Continue refining concise delivery during rapid-fire questions",
        "Include more explicit discussion of alternative strategies considered",
      ];
      suggestedNextSteps = [
        "Refine your personal storytelling for executive rounds",
        "Practice high-level strategic problem-solving scenarios",
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
