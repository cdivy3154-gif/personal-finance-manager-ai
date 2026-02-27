/**
 * Bill Split Routes
 * RESTful API routes for bill splitting management
 */
const express = require('express');
const router = express.Router();
const {
    getBills,
    createBill,
    settleParticipant,
    deleteBill
} = require('../controllers/billSplitController');

router.route('/')
    .get(getBills)
    .post(createBill);

router.route('/:id')
    .delete(deleteBill);

router.route('/:id/settle')
    .post(settleParticipant);

module.exports = router;
