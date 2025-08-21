const {
  listar,
  criar,
  buscarPorId,
  atualizar,
  remover,
  livrosDoAutor,
} = require("../services/authorsService");

const { AppError, asyncHandler } = require("../middlewares/errorHandler");

// GET /authors
const index = asyncHandler(async (req, res) => {
  const autores = await listar();
  res.json(autores);
});

// POST /authors
const store = asyncHandler(async (req, res) => {
  const { nome, bio } = req.body;

  // Validações de tipo
  if (typeof nome !== "string") {
    throw new AppError("O campo nome deve ser uma string", 422);
  }

  if (bio && typeof bio !== "string") {
    throw new AppError("O campo bio deve ser uma string", 422);
  }

  // Validações de valor
  if (!nome || nome.trim().length === 0) {
    throw new AppError("Nome é obrigatório", 422);
  }

  if (nome.length < 2) {
    throw new AppError("O nome deve ter no mínimo 2 caracteres", 422);
  }

  if (nome.length > 255) {
    return res.status(422).json({
      success: false,
      error: {
        nome: ["O campo nome deve ter no máximo 255 caracteres"],
      },
    });
  }

  if (bio && bio.length > 500) {
    return res.status(422).json({
      success: false,
      error: {
        bio: ["A bio deve ter no máximo 500 caracteres"],
      },
    });
  }

  // Criação
  const novo = await criar({ nome, bio });
  res.status(201).json({ success: true, data: novo });
});

// GET /authors/:id
const show = asyncHandler(async (req, res) => {
  const autor = await buscarPorId(req.params.id);
  if (!autor) throw new AppError("Autor não encontrado", 404);

  res.json({ success: true, data: autor });
});

// PUT /authors/:id
const update = asyncHandler(async (req, res) => {
  const { nome, nacionalidade, data_nascimento } = req.body;
  if (!nome) throw new AppError("Nome é obrigatório", 400);

  const autor = await atualizar(req.params.id, {
    nome,
    nacionalidade,
    data_nascimento,
  });
  if (!autor) throw new AppError("Autor não encontrado", 404);

  res.json({ success: true, data: autor });
});

// DELETE /authors/:id
const destroy = asyncHandler(async (req, res) => {
  const resultado = await remover(req.params.id);

  if (resultado === "nao_encontrado") {
    throw new AppError("Autor não encontrado", 404);
  }

  if (resultado === "possui_livros") {
    return res.status(409).json({
      success: false,
      error: {
        message: "Não é possível excluir autor que possui livros associados",
        code: "CONFLICT",
        status: 409,
      },
    });
  }

  res.status(204).send(); // deletado com sucesso
});


// GET /authors/:id/books
const books = asyncHandler(async (req, res) => {
  const livros = await livrosDoAutor(req.params.id);
  res.json(livros);
});

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
  books,
};
