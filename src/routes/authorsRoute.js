const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { 
  index, store, show, update, destroy, books 
} = require("../controllers/authorsController");

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: {
    success: false,
    error: {
      message: "Muitas requisições. Tente novamente em 1 minuto.",
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(limiter);

router.get("/", index);
router.post("/", store);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);
router.get("/:id/books", books);

module.exports = router;