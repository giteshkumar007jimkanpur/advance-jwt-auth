const express = require('express');

const router = express.Router();
const authenticate = require('../middlewares/authentication.middleware');

/** Example protected route */
router.get('/profile', authenticate, async (req, res) => {
  // Return the identity by the authenticate middleware
  return res.status(200).json({
    message: 'OK',
    user: req.user,
  });
});

module.exports = router;
