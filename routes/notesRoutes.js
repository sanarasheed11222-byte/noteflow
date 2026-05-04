const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/notesController');
const protect = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validation rules
const noteValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 255 }).withMessage('Title must be under 255 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
];

// All notes routes are protected
router.use(protect);

// Routes
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', noteValidation, createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;