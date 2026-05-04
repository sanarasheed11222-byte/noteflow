const express = require('express');
const router = express.Router();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const protect = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const noteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
];

router.use(protect);
router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', noteValidation, createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
