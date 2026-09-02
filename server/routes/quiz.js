import { Router } from "express";
import { store } from "../data/store.js";
import { QUIZ_DATA } from "../../src/quiz-data.js";

const router = Router();

// GET /api/quiz/questions - Retrieve quiz questions
router.get("/questions", (req, res) => {
  try {
    const questionsWithoutAnswers = QUIZ_DATA.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    res.json({
      success: true,
      experiment: QUIZ_DATA.experiment,
      description: QUIZ_DATA.description,
      total: QUIZ_DATA.questions.length,
      questions: questionsWithoutAnswers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/quiz/submit - Validate answers, calculate score and update user high score
router.post("/submit", (req, res) => {
  try {
    const { userId = "guest", userAnswers = {} } = req.body;
    let score = 0;
    const total = QUIZ_DATA.questions.length;
    const review = [];

    QUIZ_DATA.questions.forEach(q => {
      const userAnswerObj = userAnswers[q.id];
      const userChoice = typeof userAnswerObj === "object" && userAnswerObj !== null 
        ? userAnswerObj.chosenOption 
        : userAnswerObj;
      
      const isCorrect = userChoice === q.answer;
      if (isCorrect) score += 1;

      review.push({
        id: q.id,
        question: q.question,
        userChoice: userChoice || "Not Answered",
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation
      });
    });

    const percent = Math.round((score / total) * 100);
    const newHighScore = store.saveQuizHighScore(userId, score);

    // Check achievement unlocks
    if (score >= 8) store.unlockBadge(userId, "badge-quiz-pass");
    if (score === total) store.unlockBadge(userId, "badge-quiz-perfect");

    res.json({
      success: true,
      userId,
      score,
      total,
      percent,
      highScore: newHighScore,
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function handleGetHighScore(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const highScore = store.getQuizHighScore(userId);
    res.json({
      success: true,
      userId,
      highScore
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/quiz/highscore and /api/quiz/highscore/:userId
router.get("/highscore", handleGetHighScore);
router.get("/highscore/:userId", handleGetHighScore);

export default router;
