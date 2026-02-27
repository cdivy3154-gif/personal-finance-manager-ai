/**
 * Budget Routes
 * RESTful API routes for budget management
 */
const express = require('express');
const router = express.Router();
const {
    getBudget,
    setBudget,
    getBudgetUtilization
} = require('../controllers/budgetController');

// Budget CRUD
router.get('/:month', getBudget);
router.put('/:month', setBudget);

// Budget utilization (actual vs budget)
router.get('/:month/utilization', getBudgetUtilization);

module.exports = router;
