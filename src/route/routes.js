const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.json({
    message: "Backend đang chạy!",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;