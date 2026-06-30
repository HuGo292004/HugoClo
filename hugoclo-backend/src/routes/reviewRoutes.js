const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getProductReviews,
  createReview,
  markHelpful,
  deleteReview,
} = require("../controllers/reviewController");

// GET  /api/products/:productId/reviews        — lấy reviews (public)
router.get("/:productId/reviews", getProductReviews);

// POST /api/products/:productId/reviews        — tạo review (cần login)
router.post("/:productId/reviews", protect, createReview);

// PUT  /api/products/:productId/reviews/:reviewId/helpful — bấm helpful
router.put("/:productId/reviews/:reviewId/helpful", protect, markHelpful);

// DELETE /api/products/:productId/reviews/:reviewId      — xóa review
router.delete("/:productId/reviews/:reviewId", protect, deleteReview);

module.exports = router;
