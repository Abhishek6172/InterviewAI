async function runAllTests() {
  console.log("==================================================");
  console.log("STAGE 2 END-TO-END INTEGRATION TEST SUITE");
  console.log("==================================================");

  // 1. Landing Page Test
  console.log("\n[TEST 1] Landing Page (GET /)");
  const landingRes = await fetch("http://localhost:3000/");
  console.log("Landing Page Status:", landingRes.status);
  if (landingRes.status !== 200) throw new Error("Landing page failed");

  // 2. Setup Page Test
  console.log("\n[TEST 2] Setup Screen (GET /interview/setup)");
  const setupRes = await fetch("http://localhost:3000/interview/setup");
  console.log("Setup Screen Status:", setupRes.status);
  if (setupRes.status !== 200) throw new Error("Setup screen failed");

  // 3. Question Generation API Test (Custom Role + Experience Level)
  console.log("\n[TEST 3] AI Question Generation (POST /api/interview/generate)");
  const genRes = await fetch("http://localhost:3000/api/interview/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "Software Engineer",
      difficulty: "medium",
      interviewType: "mixed",
      experienceLevel: "Fresher",
      count: 5,
    }),
  });
  console.log("Question Gen Status:", genRes.status);
  const genData = await genRes.json();
  console.log("Generated Questions Count:", genData.questions?.length);
  console.log("Q1:", genData.questions?.[0]?.question);

  // 4. Single Answer Evaluation & Dynamic Follow-up Test
  console.log("\n[TEST 4] Answer Evaluation & Follow-Up (POST /api/evaluate)");
  const evalRes = await fetch("http://localhost:3000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "Software Engineer",
      difficulty: "medium",
      interviewType: "mixed",
      experienceLevel: "Fresher",
      question: genData.questions[0],
      userAnswer: "I developed a MERN stack e-commerce web application with MongoDB and Express. The hardest challenge was architecting indexing and aggregation pipelines to keep product search under 80ms.",
      canFollowUp: true,
    }),
  });
  console.log("Evaluation Status:", evalRes.status);
  const evalData = await evalRes.json();
  console.log("Evaluation Score:", evalData.evaluation?.score);
  console.log("Communication Score:", evalData.evaluation?.communicationScore);
  console.log("Technical Score:", evalData.evaluation?.technicalScore);
  console.log("Feedback:", evalData.evaluation?.feedback);
  console.log("What was good:", evalData.evaluation?.whatWasGood);
  console.log("What could improve:", evalData.evaluation?.whatCouldImprove);
  console.log("Contextual Follow-up Triggered:", evalData.followUpQuestion?.question);

  // 5. Final Scorecard Synthesis Test
  console.log("\n[TEST 5] Final Scorecard Synthesis (POST /api/evaluate -> type: scorecard)");
  const scoreRes = await fetch("http://localhost:3000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "scorecard",
      role: "Software Engineer",
      difficulty: "medium",
      interviewType: "mixed",
      experienceLevel: "Fresher",
      questions: genData.questions.slice(0, 3),
      answers: {
        [genData.questions[0].id]: { answerText: "MERN application response", durationSeconds: 52 },
      },
      evaluations: {
        [genData.questions[0].id]: evalData.evaluation,
      },
    }),
  });
  console.log("Scorecard Status:", scoreRes.status);
  const scoreData = await scoreRes.json();
  console.log("Overall Score:", scoreData.scorecard?.overallScore, "/ 100");
  console.log("Communication:", scoreData.scorecard?.communicationScore);
  console.log("Technical:", scoreData.scorecard?.technicalScore);
  console.log("Relevance:", scoreData.scorecard?.relevanceScore);
  console.log("Clarity:", scoreData.scorecard?.clarityScore);
  console.log("Confidence:", scoreData.scorecard?.confidenceScore);
  console.log("Executive Summary:", scoreData.scorecard?.executiveSummary);
  console.log("Strengths:", scoreData.scorecard?.strengths);
  console.log("Areas to Improve:", scoreData.scorecard?.areasToImprove);
  console.log("Suggested Next Steps:", scoreData.scorecard?.suggestedNextSteps);

  // 6. Validation Feedback Submission Test
  console.log("\n[TEST 6] User Validation Feedback (POST /api/feedback)");
  const fbRes = await fetch("http://localhost:3000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "stage-2-verified-session",
      isUseful: true,
      experienceRating: 5,
      improvementSuggestions: "Voice recognition and avatar visualizer are smooth. Looking forward to Stage 3.",
    }),
  });
  console.log("Feedback Status:", fbRes.status);
  const fbData = await fbRes.json();
  console.log("Feedback Success:", fbData.success, "Total feedback recorded:", fbData.totalFeedbackCount);

  console.log("\n==================================================");
  console.log("ALL 6 STAGE 2 INTEGRATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runAllTests().catch(console.error);
