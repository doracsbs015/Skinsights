const express = require('express');
const router = express.Router();
const { submitQuiz, getQuizStatus } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const quizQuestions = require('../data/quizQuestions.json');

router.get('/questions', (req, res) => res.json(quizQuestions));
router.get('/status', protect, getQuizStatus);
router.post('/submit', protect, submitQuiz);

module.exports = router;
