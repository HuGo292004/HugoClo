const express = require("express");

const router = express.Router();

// Controllers
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");

// Routes
router.post("/", createCategory);
router.get("/", getCategories);

module.exports = router;
