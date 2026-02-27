/**
 * Transaction Routes
 * RESTful API routes for transaction management
 */
const express = require('express');
const router = express.Router();
const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    suggestCategory
} = require('../controllers/transactionController');

// GET statistics (must be before /:id route)
router.get('/stats', getStats);

// GET category suggestion
router.get('/suggest-category', suggestCategory);

// CRUD routes
router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.route('/:id')
    .put(updateTransaction)
    .delete(deleteTransaction);

module.exports = router;
