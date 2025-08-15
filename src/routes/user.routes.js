const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authentication.middleware");

router.get("/profile", authenticate, async (req, res) => {
  res.send("This is home");
});

module.exports = router;
