const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { 
  index, store, show, update, destroy 
} = require("../controllers/booksController");

// Rate limit (mesmo que o dos autores)
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

// Rotas para livros
router.get("/", index);       // GET    /books
router.post("/", store);      // POST   /books
router.get("/:id", show);     // GET    /books/:id
router.put("/:id", update);   // PUT    /books/:id
router.delete("/:id", destroy); // DELETE /books/:id

module.exports = router;
