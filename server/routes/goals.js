/**
 * Savings Goal Routes
 * RESTful API routes for savings goals management
 */
const express = require('express');
const router = express.Router();
const {
    getGoals,
    createGoal,
    addFunds,
    deleteGoal
} = require('../controllers/savingsGoalController');

router.route('/')
    .get(getGoals)
    .post(createGoal);

router.route('/:id')
    .delete(deleteGoal);

router.route('/:id/add-funds')
    .post(addFunds);

module.exports = router;
