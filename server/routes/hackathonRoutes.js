const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  registerHackathon,
  getMyEntry,
  deleteRegistration,
} = require('../controllers/hackathonController');

const router = express.Router();

// All /api/hackathon/* endpoints require a verified JWT
router.use(protect);

router.post('/register', registerHackathon);
router.get('/my-entry', getMyEntry);
router.delete('/:id', deleteRegistration);

module.exports = router;

