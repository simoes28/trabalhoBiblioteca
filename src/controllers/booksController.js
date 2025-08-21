const {
  listar,
  criar,
  buscarPorId,
  atualizar,
  remover,
} = require("../services/booksService");

const { AppError, asyncHandler } = require("../middlewares/errorHandler");

// GET /books
const index = asyncHandler(async (req, res) => {
  const livros = await listar();
  res.json(livros);
});

// POST /books
const store = asyncHandler(async (req, res) => {
  const { titulo, anopublicacao, genero, autor_id } = req.body;

  if (!titulo) throw new AppError("Título é obrigatório", 400);
  if (!autor_id) throw new AppError("Autor ID é obrigatório", 400);

  const livro = await criar({ titulo, anopublicacao, genero, autor_id });
  res.status(201).json({ success: true, data: livro });
});

// GET /books/:id
const show = asyncHandler(async (req, res) => {
  const livro = await buscarPorId(req.params.id);
  if (!livro) throw new AppError("Livro não encontrado", 404);

  res.json({ success: true, data: livro });
});

// PUT /books/:id
const update = asyncHandler(async (req, res) => {
  const { titulo, anopublicacao, genero, autorid } = req.body;

  if (!titulo) throw new AppError("Título é obrigatório", 400);
  if (!autorid) throw new AppError("Autor ID é obrigatório", 400);

  const livro = await atualizar(req.params.id, {
    titulo,
    anopublicacao,
    genero,
    autorid,
  });
  if (!livro) throw new AppError("Livro não encontrado", 404);

  res.json({ success: true, data: livro });
});

// DELETE /books/:id
const destroy = asyncHandler(async (req, res) => {
  const removido = await remover(req.params.id);
  if (!removido) throw new AppError("Livro não encontrado", 404);

  if (removido === "Deletado") {
    res.status(204).end();
  }
});

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
};
