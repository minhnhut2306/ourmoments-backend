const express = require("express");
const router = express.Router();

// Import routes
const mediaRoutes = require("./media.routes");
const favoriteMediaRoutes = require("./favoriteMedia.routes");

router.get("/", (req, res) => {
  res.json({
    message: "Backend đang chạy!",
    timestamp: new Date().toISOString(),
  });
});

// Media routes
router.use("/api/media", mediaRoutes);

// Favorite media routes
router.use("/api/favorites", favoriteMediaRoutes);

module.exports = router;