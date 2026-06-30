const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cartController");

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.put("/update", protect, updateCart);
router.delete("/remove/:productId", protect, removeFromCart);

module.exports = router;
