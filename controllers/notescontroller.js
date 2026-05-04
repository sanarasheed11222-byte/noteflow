const pool = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Get all notes for logged in user
// @route   GET /api/v1/notes
const getNotes = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT id, title, content, category, tags, created_at, updated_at 
      FROM notes 
      WHERE user_id = ?
    `;
    let params = [req.userId];

    // Search filter
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Category filter
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY updated_at DESC';

    const [notes] = await pool.query(query, params);

    // Parse tags from JSON string
    const parsedNotes = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));

    res.status(200).json({
      status: 'success',
      count: parsedNotes.length,
      data: parsedNotes
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/v1/notes/:id
const getNote = async (req, res, next) => {
  try {
    const [notes] = await pool.query(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }

    const note = {
      ...notes[0],
      tags: notes[0].tags ? JSON.parse(notes[0].tags) : []
    };

    res.status(200).json({
      status: 'success',
      data: note
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/v1/notes
const createNote = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { title, content, category, tags } = req.body;

    const tagsJSON = tags ? JSON.stringify(tags) : JSON.stringify([]);

    const [result] = await pool.query(
      `INSERT INTO notes (user_id, title, content, category, tags) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, title, content, category || 'General', tagsJSON]
    );

    const [newNote] = await pool.query(
      'SELECT * FROM notes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Note created successfully',
      data: {
        ...newNote[0],
        tags: JSON.parse(newNote[0].tags)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/v1/notes/:id
const updateNote = async (req, res, next) => {
  try {
    // Check note exists and belongs to user
    const [existing] = await pool.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }

    const { title, content, category, tags } = req.body;
    const tagsJSON = tags ? JSON.stringify(tags) : JSON.stringify([]);

    await pool.query(
      `UPDATE notes 
       SET title = ?, content = ?, category = ?, tags = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [title, content, category || 'General', tagsJSON, req.params.id, req.userId]
    );

    const [updatedNote] = await pool.query(
      'SELECT * FROM notes WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Note updated successfully',
      data: {
        ...updatedNote[0],
        tags: JSON.parse(updatedNote[0].tags)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/v1/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }

    await pool.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Note deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };